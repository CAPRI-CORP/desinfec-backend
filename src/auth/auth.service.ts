import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, RecoveryEmailDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { RecoveryPasswordDto } from './dto/change-password.dto';
import { EmailTemplate } from './assets/email-template';
import { LoggedUserDto } from 'src/user/dto';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailTemplate: EmailTemplate,
  ) {}

  async signin(dto: AuthDto): Promise<{ access_token?: string }> {
    try {
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

      const payload: LoggedUserDto = {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
      };

      return this.signToken(payload);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private async signToken(
    dto: LoggedUserDto,
  ): Promise<{ access_token: string }> {
    const token = await this.jwt.signAsync(dto, {
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
    try {
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

      const randomToken = this.generateRecoveryUrl(7);

      const recoveryTokenHashed = await bcrypt.hash(
        `${user.id}/${randomToken}`,
        10,
      );

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          recoveryPassword: recoveryTokenHashed,
          recoveryPasswordValidation: new Date(Date.now() + 30 * 60000),
        },
      });

      const encodedUrl = `${process.env.FRONTEND_URL}/${encodeURIComponent(
        recoveryTokenHashed,
      )}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Recuperação de senha',
        text: 'Click no link abaixo para recuperar sua senha',
        html: this.emailTemplate.getTemplate(user.firstname, encodedUrl),
      };

      const result = await transporter.sendMail(mailOptions);

      if (result.rejected.length > 0) {
        throw new Error('Failed to send password recovery email.');
      }

      return {
        message:
          'E-mail de recuperação enviado com sucesso, verifique a caixa de spam!',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
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

  async changePassword(dto: RecoveryPasswordDto): Promise<{ message: string }> {
    try {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!.%*?&])[A-Za-z\d@$!.%*?&]{8,}$/;

      const decodedToken = decodeURIComponent(dto.token);

      const user = await this.prismaService.user.findUnique({
        where: { recoveryPassword: decodedToken },
      });

      if (!user) {
        throw new UnauthorizedException(
          'Usuário ou token não encontrados, verifique novamente!',
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

      if (user.recoveryPasswordValidation < new Date()) {
        throw new UnauthorizedException(
          'Token de recuperação de senha expirado, verifique novamente!',
        );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          recoveryPassword: null,
          recoveryPasswordValidation: null,
        },
      });

      return {
        message: 'Sua nova senha foi criada com sucesso!',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
