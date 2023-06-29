import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from '@prisma/client';

@Injectable()
export class ServiceService {
  constructor(private readonly prismaService: PrismaService) {}

  async createService(dto: CreateServiceDto): Promise<{ message: string }> {
    try {
      const findService = await this.prismaService.service.findUnique({
        where: {
          name: dto.name,
        },
      });

      if (findService) {
        throw new NotAcceptableException('Serviço já cadastrado');
      }

      await this.prismaService.service.create({
        data: { ...dto },
      });

      return { message: 'Serviço cadastrado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async getAllService(
    page: number,
    limit: number,
    name: string | null,
  ): Promise<{
    services: Array<Service>;
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      let query = {};

      if (name) {
        query = {
          OR: [{ name: { contains: name, mode: 'insensitive' } }],
        };
      }
      const [services, totalCount] = await Promise.all([
        await this.prismaService.service.findMany({
          skip: offset,
          take: limit,
          where: query,
          orderBy: { name: 'asc' },
        }),
        await this.prismaService.service.count({ where: query }),
      ]);
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = page;

      return { services, totalCount, totalPages, currentPage };
    } catch (error) {
      throw error;
    }
  }

  async getServiceById(serviceId: number): Promise<Service> {
    try {
      const findService = await this.prismaService.service.findUnique({
        where: {
          id: serviceId,
        },
      });

      if (!findService) {
        throw new NotFoundException('Serviço não encontrado');
      }

      return findService;
    } catch (error) {
      throw error;
    }
  }

  async updateService(serviceId: number, dto: CreateServiceDto) {
    try {
      const findService = await this.prismaService.service.findUnique({
        where: {
          id: serviceId,
        },
      });

      if (!findService) {
        throw new NotFoundException('Serviço não encontrado');
      }

      const findServiceByName = await this.prismaService.service.findUnique({
        where: {
          name: dto.name,
        },
      });

      if (findServiceByName && findServiceByName.id !== serviceId) {
        throw new NotAcceptableException('Serviço já cadastrado');
      }

      await this.prismaService.service.update({
        where: {
          id: serviceId,
        },
        data: { ...dto },
      });

      return { message: 'Serviço atualizado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async deleteService(serviceId: number) {
    try {
      const findService = await this.prismaService.service.findUnique({
        where: {
          id: serviceId,
        },
      });

      if (!findService) {
        throw new NotFoundException('Serviço não encontrado');
      }

      await this.prismaService.service.delete({
        where: {
          id: serviceId,
        },
      });

      return { message: 'Serviço deletado com sucesso' };
    } catch (error) {
      throw error;
    }
  }
}
