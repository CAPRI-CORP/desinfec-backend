import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { JwtGuard } from 'src/auth/guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Expenses')
@UseGuards(JwtGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post('create')
  async store(@Body() dto: CreateExpensesDto) {
    try {
      return await this.expensesService.createExpenses(dto);
    } catch (error) {
      throw error;
    }
  }

  @Get('list')
  async index() {
    try {
      return await this.expensesService.getAllExpenses();
    } catch (error) {
      throw error;
    }
  }

  @Get('show/:id')
  async show(@Param('id') id: string) {
    try {
      return await this.expensesService.getExpenseById(Number(id));
    } catch (error) {
      throw error;
    }
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.expensesService.updateExpense(Number(id), dto);
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    try {
      return await this.expensesService.deleteExpense(Number(id));
    } catch (error) {
      throw error;
    }
  }
}
