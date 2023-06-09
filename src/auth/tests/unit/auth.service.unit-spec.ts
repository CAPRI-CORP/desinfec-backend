import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from '../../dto/auth.dto';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    prismaService = new PrismaService();
    jwtService = new JwtService();
    configService = new ConfigService();
    authService = new AuthService(prismaService, jwtService, configService);
  });

  describe('success signin', () => {
    it('should return access token when valid credentials are provided', async () => {
      const access_token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTY4NjI3MDkwOSwiZXhwIjoxNjg2Mjg1MzA5fQ.Sdj82tuvrov4N8PGIhS5VjYLYISeKsiqvsUgdGocIZU';

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password:
          '$argon2id$v=19$m=65536,t=3,p=4$Z7RyIPY4crmqtDmvkbaIog$tlrC0/22222/K111111',
        firstname: 'John',
        lastname: 'Doe',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dto: AuthDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(access_token);

      const result = await authService.signin(dto);

      expect(result).toEqual({ access_token });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.password,
        dto.password,
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id, email: mockUser.email }),
        expect.any(Object),
      );
    });
  });

  describe('should throw UnauthorizedException when invalid credentials are provided', () => {
    it('no email provided', async () => {
      const dto: AuthDto = {
        email: '',
        password: 'password',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.signin(dto)).rejects.toThrow(
        new UnauthorizedException(
          'E-mail ou Senha não encontrados, verifique novamente!',
        ),
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });

    it('no password provided', async () => {
      const dto: AuthDto = {
        email: 'teste@teste.com',
        password: '',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.signin(dto)).rejects.toThrow(
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
