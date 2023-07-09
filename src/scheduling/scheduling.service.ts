import { Service } from '@prisma/client';
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

      const existingServices = await this.prismaService.service.findMany({
        where: {
          id: {
            in: dto.serviceId,
          },
        },
      });

      if (existingServices.length !== dto.serviceId.length) {
        throw new NotFoundException('Serviço não encontrado');
      }

      const dateObj = this.refactorDate(
        dto.date,
        dto.initialTime,
        dto.conclusionTime,
      );

      const createdScheduling = await this.prismaService.scheduling.create({
        data: {
          customerId: dto.customerId,
          userId: dto.userId,
          observations: dto.observations,
          cost: dto.cost,
          initialDate: dateObj.initialDate,
          finalDate: dateObj.finalDate,
        },
      });

      const schedulingId = createdScheduling.id;

      const scheduledServices = dto.serviceId.map((serviceId) => {
        return {
          schedulingId,
          serviceId,
        };
      });

      await this.prismaService.scheduledService.createMany({
        data: scheduledServices,
      });

      return { message: 'Agendamento criado com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  private refactorDate(date, initialTime, conclusionTime) {
    const initialTimeParts = initialTime.split(':');
    const conclusionTimeParts = conclusionTime.split(':');
    const initialDate = new Date(date);
    const finalDate = new Date(date);

    initialDate.setUTCHours(Number(initialTimeParts[0]));
    initialDate.setUTCMinutes(Number(initialTimeParts[1]));
    initialDate.setUTCSeconds(Number(initialTimeParts[2]));

    finalDate.setUTCHours(Number(conclusionTimeParts[0]));
    finalDate.setUTCMinutes(Number(conclusionTimeParts[1]));
    finalDate.setUTCSeconds(Number(conclusionTimeParts[2]));

    const initialDateISO = initialDate.toISOString();
    const finalDateISO = finalDate.toISOString();

    const dateObj = {
      initialDate: initialDateISO,
      finalDate: finalDateISO,
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
          ScheduledService: { select: { Service: true } },

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
            ScheduledService: { select: { Service: true } },
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

      const existingServices = await this.prismaService.service.findMany({
        where: {
          id: {
            in: dto.serviceId,
          },
        },
      });

      if (existingServices.length !== dto.serviceId.length) {
        throw new NotFoundException('Serviço não encontrado');
      }

      const dateObj = this.refactorDate(
        dto.date,
        dto.initialTime,
        dto.conclusionTime,
      );

      await Promise.all([
        // Delete scheduled services with missing serviceId values
        this.prismaService.scheduledService.deleteMany({
          where: {
            schedulingId,
            NOT: {
              serviceId: {
                in: dto.serviceId,
              },
            },
          },
        }),

        // Add new scheduled services
        ...dto.serviceId.map(async (service) => {
          await this.prismaService.scheduledService.create({
            data: {
              schedulingId,
              serviceId: service,
            },
          });
        }),

        // Update the scheduling record
        this.prismaService.scheduling.update({
          where: {
            id: schedulingId,
          },
          data: {
            cost: dto.cost,
            observations: dto.observations,
            initialDate: dateObj.initialDate,
            finalDate: dateObj.finalDate,
            userId: dto.userId,
            customerId: dto.customerId,
          },
        }),
      ]);

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
            ScheduledService: {
              include: {
                Service: true,
              },
            },
            User: true,
          },
        });

        const serviceNames = reports.flatMap((report) =>
          report.ScheduledService.map(
            (scheduledService) => scheduledService.Service.name,
          ),
        );
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
