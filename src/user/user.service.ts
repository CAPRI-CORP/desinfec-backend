import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggedUserDto } from './dto';
import * as bcrypt from 'bcrypt';
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

      await this.prisma.user.create({
        data: {
          firstname: dto.firstname,
          lastname: dto.lastname,
          phone: dto.phone,
          email: dto.email,
          password: await bcrypt.hash(dto.password, 10),
        },
      });

      return { message: 'Usuário cadastrado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async getUsers(
    page: number,
    limit: number,
    name: string | null,
  ): Promise<{
    users: Array<LoggedUserDto>;
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      let query = {};

      if (name) {
        query = {
          OR: [
            { firstname: { contains: name, mode: 'insensitive' } },
            { lastname: { contains: name, mode: 'insensitive' } },
          ],
        };
      }

      const [users, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          skip: offset,
          take: limit,
          where: query,
          orderBy: { firstname: 'asc' },
        }),
        this.prisma.user
          .findMany({
            where: query,
            orderBy: { firstname: 'asc' },
          })
          .then((users) => users.length),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = page;

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

      return { users: usersDto, totalCount, totalPages, currentPage };
    } catch (error) {
      throw error;
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
      throw error;
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

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstname: dto.firstname,
          lastname: dto.lastname,
          phone: dto.phone,
          email: dto.email,
          password: await bcrypt.hash(dto.password, 10),
        },
      });

      return { message: 'Usuário atualizado com sucesso' };
    } catch (error) {
      throw error;
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
      throw error;
    }
  }
}
