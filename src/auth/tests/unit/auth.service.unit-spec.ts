import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from '../../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { EmailTemplate } from 'src/auth/assets';
import * as nodemailer from 'nodemailer';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailTemplate: EmailTemplate;

  beforeEach(async () => {
    configService = new ConfigService();
    prismaService = new PrismaService(configService);
    jwtService = new JwtService();
    authService = new AuthService(
      prismaService,
      jwtService,
      configService,
      emailTemplate,
    );
    emailTemplate = new EmailTemplate();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$Z7RyIPY4crmqtDmvkbaIog$tlrC0/22222/K111111',
    firstname: 'John',
    lastname: 'Doe',
    phone: '1234567890',
    recoveryPassword: 'abc3456',
    recoveryPasswordValidation: new Date(Date.now() + 30 * 60000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const dto: AuthDto = {
    email: 'teste@teste.com',
    password: 'passworD!123',
  };

  describe('signin', () => {
    const access_token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTY4NjI3MDkwOSwiZXhwIjoxNjg2Mjg1MzA5fQ.Sdj82tuvrov4N8PGIhS5VjYLYISeKsiqvsUgdGocIZU';

    describe('success signin', () => {
      it('should return access token when valid credentials are provided', async () => {
        jest
          .spyOn(prismaService.user, 'findUnique')
          .mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        jest.spyOn(jwtService, 'signAsync').mockResolvedValue(access_token);

        const result = await authService.signin(dto);

        expect(result).toEqual({ access_token });

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: dto.email },
        });

        expect(bcrypt.compare).toHaveBeenCalledWith(
          dto.password,
          mockUser.password,
        );

        expect(jwtService.signAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            firstname: mockUser.firstname,
            lastname: mockUser.lastname,
            phone: mockUser.phone,
          }),
          expect.any(Object),
        );
      });
    });

    describe('should throw UnauthorizedException when invalid credentials are provided', () => {
      it('should throw when no email provided', async () => {
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

        await expect(
          authService.signin({ email: '', password: dto.password }),
        ).rejects.toThrow(
          new UnauthorizedException(
            'E-mail ou Senha não encontrados, verifique novamente!',
          ),
        );

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: '' },
        });
      });

      it('should throw when no password provided', async () => {
        jest
          .spyOn(prismaService.user, 'findUnique')
          .mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        await expect(
          authService.signin({ email: dto.email, password: '' }),
        ).rejects.toThrow(
          new UnauthorizedException(
            'E-mail ou Senha não encontrados, verifique novamente!',
          ),
        );

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: dto.email },
        });
      });

      it('should throw when email not found', async () => {
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

        await expect(
          authService.signin({
            email: 'teste@123.com',
            password: dto.password,
          }),
        ).rejects.toThrow(
          new UnauthorizedException(
            'E-mail ou Senha não encontrados, verifique novamente!',
          ),
        );

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'teste@123.com' },
        });
      });

      it('should throw when password does not match', async () => {
        jest
          .spyOn(prismaService.user, 'findUnique')
          .mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        await expect(
          authService.signin({ email: dto.email, password: 'password' }),
        ).rejects.toThrow(
          new UnauthorizedException(
            'E-mail ou Senha não encontrados, verifique novamente!',
          ),
        );

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: dto.email },
        });
      });
    });
  });

  describe('sendPasswordRecoveryEmail', () => {
    describe('success send password recovery email', () => {
      it('should return success message when email is sent', async () => {
        const findUniqueSpy = jest
          .spyOn(prismaService.user, 'findUnique')
          .mockResolvedValue(mockUser);

        const sendMailSpy = jest.fn().mockResolvedValue({
          rejected: [],
        });

        const createTransportSpy = jest
          .spyOn(nodemailer, 'createTransport')
          .mockReturnValue({
            sendMail: sendMailSpy,
          } as any);

        const hashSpy = jest
          .spyOn(bcrypt, 'hash')
          .mockResolvedValue('hashedToken');

        const updateSpy = jest
          .spyOn(prismaService.user, 'update')
          .mockResolvedValue(undefined);

        const getTemplateSpy = jest
          .spyOn(EmailTemplate.prototype, 'getTemplate')
          .mockReturnValue('<html><body>Template</body></html>');

        const result = await authService.sendPasswordRecoveryEmail({
          email: dto.email,
        });

        expect(findUniqueSpy).toHaveBeenCalledTimes(1);
        expect(sendMailSpy).toHaveBeenCalledTimes(1);
        expect(createTransportSpy).toHaveBeenCalledTimes(1);
        expect(hashSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(getTemplateSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          message:
            'E-mail de recuperação enviado com sucesso, verifique a caixa de spam!',
        });
      });
    });
    describe('should trhow UnauthorizedException when invalid data is provided', () => {
      it('should trhow when email not found', async () => {
        const findUniqueSpy = jest
          .spyOn(prismaService.user, 'findUnique')
          .mockResolvedValue(null);

        await expect(
          authService.sendPasswordRecoveryEmail({ email: 'test@123.com' }),
        ).rejects.toThrow(
          new UnauthorizedException(
            'E-mail não encontrado, verifique novamente!',
          ),
        );

        expect(findUniqueSpy).toHaveBeenCalledTimes(1);
      });

      it('should trhow when have problems to send email', async () => {
        const findUniqueSpy = jest
          .spyOn(prismaService.user, 'findUnique')
          .mockResolvedValue(mockUser);

        const sendMailSpy = jest.fn().mockResolvedValue({
          rejected: ['error'],
        });

        const createTransportSpy = jest
          .spyOn(nodemailer, 'createTransport')
          .mockReturnValue({
            sendMail: sendMailSpy,
          } as any);

        const hashSpy = jest
          .spyOn(bcrypt, 'hash')
          .mockResolvedValue('hashedToken');

        const updateSpy = jest
          .spyOn(prismaService.user, 'update')
          .mockResolvedValue(undefined);

        const getTemplateSpy = jest
          .spyOn(EmailTemplate.prototype, 'getTemplate')
          .mockReturnValue('<html><body>Template</body></html>');

        await expect(
          authService.sendPasswordRecoveryEmail({ email: 'test@123.com' }),
        ).rejects.toThrow(
          new UnauthorizedException(
            'Falha ao enviar e-mail, tente novamente mais tarde!',
          ),
        );

        expect(findUniqueSpy).toHaveBeenCalledTimes(1);
        expect(sendMailSpy).toHaveBeenCalledTimes(1);
        expect(createTransportSpy).toHaveBeenCalledTimes(1);
        expect(hashSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(getTemplateSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
