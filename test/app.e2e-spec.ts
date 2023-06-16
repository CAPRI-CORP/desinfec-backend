import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'john@example.com',
      password: 'password',
    };

    describe('signin', () => {
      it('should throw if email is empty', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({ password: dto.password })
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
          .send({ email: dto.email })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain(
              'E-mail ou Senha não encontrados, verifique novamente!',
            );
          });
      });

      it('should throw if no body provided', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({})
          .expect(400)
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
          .send(dto)
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
      it('should send the Email', () => {
        return request(app.getHttpServer())
          .post('/auth/recovery-email')
          .send({ email: dto.email })
          .expect(200)
          .expect((res) => {
            expect(res.body.message).toBe(
              'E-mail de recuperação enviado com sucesso, verifique a caixa de spam!',
            );
          });
      });
    });
  });
});
