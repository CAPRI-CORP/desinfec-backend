import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Expenses } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createExpenses(dto: CreateExpensesDto): Promise<{ message: string }> {
    try {
      const findExpense = await this.prismaService.expenses.findMany({
        where: {
          name: dto.name,
          date: dto.date,
        },
      });

      if (findExpense.length > 0) {
        throw new NotAcceptableException('Despesa já cadastrada');
      }

      await this.prismaService.expenses.create({
        data: { ...dto },
      });

      return { message: 'Despesa cadastrada com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async getAllExpenses(): Promise<Array<Expenses>> {
    try {
      return await this.prismaService.expenses.findMany();
    } catch (error) {
      throw error;
    }
  }

  async getExpenseById(expenseId: number): Promise<Expenses> {
    try {
      const findExpense = await this.prismaService.expenses.findUnique({
        where: {
          id: expenseId,
        },
      });

      if (!findExpense) {
        throw new NotFoundException('Despesa não encontrada');
      }

      return findExpense;
    } catch (error) {
      throw error;
    }
  }

  async updateExpense(expenseId: number, dto: CreateExpensesDto) {
    try {
      const findExpense = await this.prismaService.expenses.findUnique({
        where: {
          id: expenseId,
        },
      });

      if (!findExpense) {
        throw new NotFoundException('Despesa não encontrada');
      }

      const findExpenseByName = await this.prismaService.expenses.findMany({
        where: {
          name: dto.name,
          date: dto.date,
        },
      });

      if (
        findExpenseByName.length > 0 &&
        findExpenseByName[0].id !== expenseId
      ) {
        throw new NotAcceptableException('Despesa já cadastrada');
      }

      await this.prismaService.expenses.update({
        where: {
          id: expenseId,
        },
        data: { cost: dto.cost, date: new Date(dto.date), name: dto.name },
      });

      return { message: 'Despesa atualizada com sucesso' };
    } catch (error) {
      throw error;
    }
  }

  async deleteExpense(expenseId: number) {
    try {
      const findExpense = await this.prismaService.expenses.findUnique({
        where: {
          id: expenseId,
        },
      });

      if (!findExpense) {
        throw new NotFoundException('Serviço não encontrado');
      }

      await this.prismaService.expenses.delete({
        where: {
          id: expenseId,
        },
      });

      return { message: 'Despesa deletada com sucesso' };
    } catch (error) {
      throw error;
    }
  }
}