import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, RecoveryEmailDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { RecoveryPasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: AuthDto): Promise<{ access_token?: string }> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'E-mail ou Senha não encontrados, verifique novamente!',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException(
        'E-mail ou Senha não encontrados, verifique novamente!',
      );
    }

    return this.signToken(user.id, user.email);
  }

  private async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { userId, email };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '4h',
      secret: this.config.get('JWT_SECRET') || 'secret',
    });
    return {
      access_token: token,
    };
  }

  async sendPasswordRecoveryEmail(
    dto: RecoveryEmailDto,
  ): Promise<{ message: string }> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'E-mail não encontrado, verifique novamente!',
      );
    }

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const recoveryToken = await bcrypt.hash(this.generateRecoveryUrl(7));

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        recoveryPassword: recoveryToken,
        recoveyPasswordValidation: new Date(Date.now() + 30 * 60000),
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Recuperação de senha',
      text: 'Click no link abaixo para recuperar sua senha',
      html: `<a href="${
        process.env.FRONTEND_URL + recoveryToken
      }">Clique aqui</a>`,
    };

    const result = await transporter.sendMail(mailOptions);

    if (result.rejected.length > 0) {
      throw new Error('Failed to send password recovery email.');
    }

    return {
      message:
        'E-mail de recuperação enviado com sucesso, verifique a caixa de spam!',
    };
  }

  private generateRecoveryUrl(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }

  async changePassword(
    userId: number,
    recoveryPassword: string,
    dto: RecoveryPasswordDto,
  ): Promise<{ message: string }> {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Usuário não encontrado, verifique novamente!',
      );
    }

    if (dto.password !== dto.confirmPassword) {
      throw new UnauthorizedException(
        'A senha e a confirmação de senha devem ser iguais.',
      );
    }

    if (passwordRegex.test(dto.password) === false) {
      throw new UnauthorizedException(
        'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.',
      );
    }

    if (user.recoveryPassword !== recoveryPassword)
      throw new UnauthorizedException(
        'Token de recuperação de senha inválido, verifique novamente!',
      );

    if (user.recoveyPasswordValidation < new Date()) {
      throw new UnauthorizedException(
        'Token de recuperação de senha expirado, verifique novamente!',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        recoveryPassword: null,
        recoveyPasswordValidation: null,
      },
    });

    return {
      message: 'Sua nova senha foi criada com sucesso!',
    };
  }
}
