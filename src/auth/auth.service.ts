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

    const randomToken = this.generateRecoveryUrl(7);

    const recoveryTokenHashed = await bcrypt.hash(
      `${user.id}/${randomToken}`,
      10,
    );

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        recoveryPassword: recoveryTokenHashed,
        recoveyPasswordValidation: new Date(Date.now() + 30 * 60000),
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Recuperação de senha',
      text: 'Click no link abaixo para recuperar sua senha',
      html: `
      <body style="margin: 0; padding: 0; position: relative; height: 100vh;">
    <main style="display: flex; flex-direction: column; align-items: center">
      <div style="position: relative">
        <svg
          style="
            position: relative;
            width: 1440px;
            height: 467px;
            top: -50;
            left: 0;
          "
          viewBox="0 0 1440 467"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1440 379.101C1440 379.101 723.626 510.127 317.288 452.235C176.636 432.195 0 379.101 0 379.101V0L1440 0V379.101Z"
            fill="#A0CCD9"
          />
        </svg>

        <svg
          style="
            position: absolute;
            width: 1440px;
            height: 409px;
            top: 35%;
            left: 50%;
            transform: translate(-50%, -50%);
          "
          viewBox="0 0 1440 409"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1440 331.508C1440 331.508 723.626 446.085 317.288 395.461C176.636 377.937 0 331.508 0 331.508V0L1440 0V331.508Z"
            fill="#7DBFEB"
          />
        </svg>

        <h1
          style="
            font-size: 48px;
            font-weight: 700;
            color: #fff;
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
          "
        >
          Recuperação de Senha
        </h1>
      </div>

      <div style="position: relative; height: 70vh">
        <div
          style="
            font-size: 36px;
            font-style: normal;
            line-height: 42px;
            color: #000;
            font-weight: 400;
          "
        >
          <p>Olá, ${user.firstname},</p>
          <p>Para recuperar o seu login é nescessário refazer a sua senha.</p>
          <p>Clique no link abaixo para continuar</p>
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 25px 0 25px 0;
          "
        >
          <a href="${
            process.env.FRONTEND_URL + recoveryTokenHashed
          }" target="_blank">
            <button
              style="
                padding: 0.5rem 2.5rem 0.5rem 2.5rem;
                background-color: #0079c7;
                border-radius: 5px;
                border: none;
                color: #fff;
                font-size: 32px;
                cursor: pointer;
              "
            >
              Redefinir a senha
            </button>
          </a>
        </div>
        <div
          style="
            font-size: 36px;
            font-style: normal;
            line-height: 42px;
            color: #000;
            font-weight: 400;
          "
        >
          <p>Não está conseguindo acessar a página?</p>
          <a style="color: #80b9fc; margin-bottom: 50px;" href="${
            process.env.FRONTEND_URL + recoveryTokenHashed
          }" target="_blank">
            Clique aqui para continuar.
          </a>
        </div>
      </div>
    </main>
  </body>
  <footer
    style="
      background-color: #7dbfeb;
      height: 5vh;
      position: fixed;
      bottom: 0;
      width: 100%;
      text-align: center;
    "
  >
    <p style="font-size: 24px; margin-top: 10px; color: #000">
      Desenvolvido por Cápri Corp.
    </p>
  </footer>
      `,
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

  async changePassword(dto: RecoveryPasswordDto): Promise<{ message: string }> {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const user = await this.prismaService.user.findUnique({
      where: { recoveryPassword: dto.token },
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

    if (user.recoveryPassword !== dto.token)
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
