import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSchedulingDto } from './dto';

@Injectable()
export class SchedulingService {
  constructor(private prismaService: PrismaService) {}

  async create(dto: CreateSchedulingDto): Promise<{ message: string }> {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          id: dto.userId,
        },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const existingCustomer = await this.prismaService.customer.findUnique({
        where: {
          id: dto.customerId,
        },
      });

      if (!existingCustomer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      const existingService = await this.prismaService.service.findUnique({
        where: {
          id: dto.serviceId,
        },
      });

      if (!existingService) {
        throw new NotFoundException('Serviço não encontrado');
      }

      const dateObj = this.refactorDate(
        dto.date,
        dto.initialTime,
        dto.conslusionTime,
      );

      await this.prismaService.scheduling.create({
        data: {
          customerId: dto.customerId,
          serviceId: dto.serviceId,
          userId: dto.userId,
          observations: dto.observations,
          initialDate: dateObj.initialDate,
          finalDate: dateObj.finalDate,
        },
      });

      return { message: 'Agendamento criado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  private refactorDate(date, initialTime, conslusionTime) {
    const initialTimeParts = initialTime.split(':');
    const conslusionTimeParts = conslusionTime.split(':');

    const initialDate = new Date(date);
    initialDate.setHours(Number(initialTimeParts[0]));
    initialDate.setMinutes(Number(initialTimeParts[1]));
    initialDate.setSeconds(Number(initialTimeParts[2]));

    const finalDate = new Date(date);
    finalDate.setHours(Number(conslusionTimeParts[0]));
    finalDate.setMinutes(Number(conslusionTimeParts[1]));
    finalDate.setSeconds(Number(conslusionTimeParts[2]));

    const dateObj = {
      initialDate,
      finalDate,
    };

    return dateObj;
  }

  async getAllSchedulings(
    initialDate: string | null,
    finalDate: string | null,
  ) {
    try {
      if (initialDate && finalDate) {
        return this.getReports(initialDate, finalDate);
      }
      return await this.prismaService.scheduling.findMany({
        include: {
          Customer: true,
          Service: true,
          User: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getSchedulingById(schedulingId: number) {
    try {
      const existingScheduling = await this.prismaService.scheduling.findUnique(
        {
          where: {
            id: schedulingId,
          },
          include: {
            Customer: true,
            Service: true,
            User: true,
          },
        },
      );

      if (!existingScheduling) {
        throw new NotFoundException('Agendamento não encontrado');
      }

      return existingScheduling;
    } catch (error) {
      throw error;
    }
  }

  async updateScheduling(schedulingId: number, dto: CreateSchedulingDto) {
    try {
      const existingScheduling = await this.prismaService.scheduling.findUnique(
        {
          where: {
            id: schedulingId,
          },
        },
      );

      if (!existingScheduling) {
        throw new NotFoundException('Agendamento não encontrado');
      }

      const existingUser = await this.prismaService.user.findUnique({
        where: {
          id: dto.userId,
        },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const existingCustomer = await this.prismaService.customer.findUnique({
        where: {
          id: dto.customerId,
        },
      });

      if (!existingCustomer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      const existingService = await this.prismaService.service.findUnique({
        where: {
          id: dto.serviceId,
        },
      });

      if (!existingService) {
        throw new NotFoundException('Serviço não encontrado');
      }

      const dateObj = this.refactorDate(
        dto.date,
        dto.initialTime,
        dto.conslusionTime,
      );

      await this.prismaService.scheduling.update({
        where: {
          id: schedulingId,
        },
        data: {
          customerId: dto.customerId,
          serviceId: dto.serviceId,
          userId: dto.userId,
          observations: dto.observations,
          initialDate: dateObj.initialDate,
          finalDate: dateObj.finalDate,
        },
      });

      return { message: 'Agendamento atualizado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async deleteScheduling(schedulingId: number) {
    try {
      const existingScheduling = await this.prismaService.scheduling.findUnique(
        {
          where: {
            id: schedulingId,
          },
        },
      );

      if (!existingScheduling) {
        throw new NotFoundException('Agendamento não encontrado');
      }

      await this.prismaService.scheduling.delete({
        where: {
          id: schedulingId,
        },
      });

      return { message: 'Agendamento deletado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  private async getReports(initialDate: string, finalDate: string) {
    try {
      if (initialDate && finalDate) {
        const reports = await this.prismaService.scheduling.findMany({
          where: {
            initialDate: {
              gte: new Date(initialDate),
            },
            finalDate: {
              lte: new Date(finalDate),
            },
          },
          include: {
            Customer: true,
            Service: true,
            User: true,
          },
        });

        const serviceNames = reports.map((report) => report.Service.name);

        const serviceCount = {};

        serviceNames.forEach((service) => {
          if (serviceCount.hasOwnProperty(service)) {
            serviceCount[service]++;
          } else {
            serviceCount[service] = 1;
          }
        });

        const result = Object.keys(serviceCount).map((service) => ({
          name: service,
          count: serviceCount[service],
        }));

        return result;
      }
    } catch (error) {
      throw error;
    }
  }
}
