import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggedUserDto } from './dto';

@Injectable()
export class UserService {
  private passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<{ message: string }> {
    try {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      const userWithPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });

      if (userWithEmail) {
        throw new UnauthorizedException('Email Já cadastrado');
      }

      if (userWithPhone) {
        throw new UnauthorizedException('Telefone Já cadastrado');
      }

      if (dto.password !== dto.confirmPassword) {
        throw new UnauthorizedException('Senhas não conferem');
      }
      if (this.passwordRegex.test(dto.password) === false) {
        throw new UnauthorizedException(
          'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.',
        );
      }

      await this.prisma.user.create({ data: dto });

      return { message: 'Usuário cadastrado com sucesso' };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async getUsers(): Promise<Array<LoggedUserDto>> {
    try {
      const users = await this.prisma.user.findMany();

      const usersDto = users.map((user) => {
        const userDto: LoggedUserDto = {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone,
          email: user.email,
        };

        return userDto;
      });

      return usersDto;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async getUserById(userId: number): Promise<LoggedUserDto> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const userDto: LoggedUserDto = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        email: user.email,
      };

      return userDto;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async updateUser(
    userId: number,
    dto: CreateUserDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      if (dto.password !== dto.confirmPassword) {
        throw new UnauthorizedException('Senhas não conferem');
      }

      if (this.passwordRegex.test(dto.password) === false) {
        throw new UnauthorizedException(
          'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.',
        );
      }

      await this.prisma.user.update({ where: { id: userId }, data: dto });

      return { message: 'Usuário atualizado com sucesso' };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      await this.prisma.user.delete({ where: { id: userId } });

      return { message: 'Usuário deletado com sucesso' };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
