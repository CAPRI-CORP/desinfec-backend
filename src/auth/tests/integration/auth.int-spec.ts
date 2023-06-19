import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { AuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as nodemailer from 'nodemailer';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'john@example.com',
      password: 'passworD1!57',
    };

    describe('signin', () => {
      it('should throw if email is empty', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({ password: authDto.password })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'E-mail ou Senha não encontrados, verifique novamente!',
            );
          });
      });

      it('should throw if password is empty', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({ email: authDto.email })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'E-mail ou Senha não encontrados, verifique novamente!',
            );
          });
      });

      it('should throw if password is wrong', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({ email: authDto.email, password: 'wrongPassword' })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'E-mail ou Senha não encontrados, verifique novamente!',
            );
          });
      });

      it('should throw if email is wrong', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({ email: 'test@test.com', password: authDto.password })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'E-mail ou Senha não encontrados, verifique novamente!',
            );
          });
      });

      it('should signin', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({ email: authDto.email, password: authDto.password })
          .expect(200)
          .expect((res) => {
            expect(res.body.access_token).toBeDefined();
          });
      });
    });

    describe('recovery-email', () => {
      it('should throw if email is empty', () => {
        return request(app.getHttpServer())
          .post('/auth/recovery-email')
          .send({ email: '' })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'E-mail não encontrado, verifique novamente!',
            );
          });
      });

      it('should throw if email is not found', () => {
        return request(app.getHttpServer())
          .post('/auth/recovery-email')
          .send({ email: 'test@test.com' })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'E-mail não encontrado, verifique novamente!',
            );
          });
      });

      it('should throw if cant sand the email', () => {
        const mockTransporter = {
          sendMail: jest.fn().mockResolvedValue({ rejected: ['error'] }),
        };
        jest
          .spyOn(nodemailer, 'createTransport')
          .mockReturnValue(mockTransporter);
        return request(app.getHttpServer())
          .post('/auth/recovery-email')
          .send({ email: authDto.email })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'Falha ao enviar e-mail, tente novamente mais tarde!',
            );
          });
      });

      it('should send the Email', () => {
        const mockTransporter = {
          sendMail: jest.fn().mockResolvedValue({ rejected: [] }),
        };
        jest
          .spyOn(nodemailer, 'createTransport')
          .mockReturnValue(mockTransporter);

        return request(app.getHttpServer())
          .post('/auth/recovery-email')
          .send({ email: authDto.email })
          .expect(200)
          .expect((res) => {
            expect(res.body.message).toBe(
              'E-mail de recuperação enviado com sucesso, verifique a caixa de spam!',
            );
          });
      });
    });

    describe('change-password', () => {
      let token: string;
      it('should get the recovery token', async () => {
        const user = await prismaService.user.findUnique({
          where: { email: authDto.email },
        });
        token = user.recoveryPassword;
        expect(token).toBeDefined();
      });

      it('should throw if token is empty', () => {
        return request(app.getHttpServer())
          .put('/auth/change-password')
          .send({
            token: '',
            password: 'password',
            confirmPassword: 'password',
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain('Token inválido!');
          });
      });

      it('should throw if token is invalid', () => {
        return request(app.getHttpServer())
          .put('/auth/change-password')
          .send({
            token: 'token',
            password: 'password',
            confirmPassword: 'password',
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'Usuário ou token não encontrados, verifique novamente!',
            );
          });
      });

      it('should throw if password is empty', () => {
        return request(app.getHttpServer())
          .put('/auth/change-password')
          .send({ confirmPassword: 'password' })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.',
            );
          });
      });

      it('should throw if confirmPassword is empty', () => {
        return request(app.getHttpServer())
          .put('/auth/change-password')
          .send({ password: 'password' })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.',
            );
          });
      });

      it('should throw if password and confirmPassword are no equal', () => {
        return request(app.getHttpServer())
          .put('/auth/change-password')
          .send({ password: 'password', confirmPassword: 'password1', token })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'A senha e a confirmação de senha devem ser iguais.',
            );
          });
      });

      it('should throw if password does not match the requirements', () => {
        return request(app.getHttpServer())
          .put('/auth/change-password')
          .send({ password: 'password', confirmPassword: 'password', token })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.',
            );
          });
      });

      it('should update the recoveryPasswordValidation', async () => {
        const user = await prismaService.user.update({
          where: { email: authDto.email },
          data: { recoveryPasswordValidation: new Date('2022-01-01') },
        });
        expect(user.recoveryPasswordValidation).toEqual(new Date('2022-01-01'));
      });

      it('should throw if recoveryToken is expired', () => {
        return request(app.getHttpServer())
          .put('/auth/change-password')
          .send({
            password: 'passworD1!57',
            confirmPassword: 'passworD1!57',
            token,
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'Token de recuperação de senha expirado, verifique novamente!',
            );
          });
      });

      it('should update the recoveryPasswordValidation', async () => {
        const currentDate = new Date();
        const newDate = new Date(currentDate.getTime() + 3600000);
        const user = await prismaService.user.update({
          where: { email: authDto.email },
          data: { recoveryPasswordValidation: newDate },
        });
        expect(user.recoveryPasswordValidation).toEqual(newDate);
      });

      it('should update the password', () => {
        return request(app.getHttpServer())
          .put('/auth/change-password')
          .send({
            password: 'passworD1!57',
            confirmPassword: 'passworD1!57',
            token,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'Sua nova senha foi criada com sucesso!',
            );
          });
      });
    });
  });
});
