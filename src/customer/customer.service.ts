import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerDto } from './dto';
import { Customer } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prismaService: PrismaService) {}

  async createCustomer(dto: CreateCustomerDto): Promise<{ message: string }> {
    try {
      const existingEmail = await this.prismaService.customer.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (existingEmail) {
        throw new NotAcceptableException('Email já cadastrado');
      }

      const existingPhone = await this.prismaService.customer.findUnique({
        where: {
          phone: dto.phone,
        },
      });

      if (existingPhone) {
        throw new NotAcceptableException('Telefone já cadastrado');
      }

      await this.prismaService.customer.create({
        data: {
          ...dto,
        },
      });

      return { message: 'Cliente cadastrado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async getAllCustomers(): Promise<Array<Customer>> {
    try {
      return await this.prismaService.customer.findMany();
    } catch (error) {
      throw error;
    }
  }

  async getCustomerById(customerId: number): Promise<Customer> {
    try {
      const existingCustomer = await this.prismaService.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!existingCustomer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      return await this.prismaService.customer.findUnique({
        where: {
          id: customerId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(
    customerId: number,
    dto: CreateCustomerDto,
  ): Promise<{ message: string }> {
    try {
      const existingCustomer = await this.prismaService.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!existingCustomer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      const existingEmail = await this.prismaService.customer.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (existingEmail) {
        throw new NotAcceptableException('Email já cadastrado');
      }

      const existingPhone = await this.prismaService.customer.findUnique({
        where: {
          phone: dto.phone,
        },
      });

      if (existingPhone) {
        throw new NotAcceptableException('Telefone já cadastrado');
      }

      await this.prismaService.customer.update({
        where: {
          id: customerId,
        },
        data: {
          ...dto,
        },
      });

      return { message: 'Cliente atualizado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async deleteCustomer(customerId: number): Promise<{ message: string }> {
    try {
      const existingCustomer = await this.prismaService.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!existingCustomer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      await this.prismaService.customer.delete({
        where: {
          id: customerId,
        },
      });

      return { message: 'Cliente deletado com sucesso' };
    } catch (error) {
      throw error;
    }
  }
}
