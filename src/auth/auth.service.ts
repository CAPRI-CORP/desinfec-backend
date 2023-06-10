import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, RecoveryEmailDto } from './dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: AuthDto): Promise<{ access_token: string }> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'E-mail ou Senha não encontrados, verifique novamente!',
      );
    }

    const isMatch = await argon2.verify(user.password, dto.password);

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

  async sendPasswordRecoveryEmail(dto: RecoveryEmailDto) {
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

      const recoveryToken = this.generateRecoveryUrl(7);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Recuperação de senha',
        text: 'Click no link abaixo para recuperar sua senha',
        html: `<a href="${
          process.env.FRONTEND_URL + recoveryToken
        }">Click Here</a>`,
      };

      const result = await transporter.sendMail(mailOptions);

      if (result.rejected.length > 0) {
        throw new Error('Failed to send password recovery email.');
      }

      return { message: 'E-mail de recuperação enviado com sucesso!' };
    } catch (error) {
      return { message: error.message };
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
}
