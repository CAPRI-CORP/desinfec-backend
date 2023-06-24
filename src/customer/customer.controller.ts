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
import { JwtGuard } from 'src/auth/guard';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Customers')
@UseGuards(JwtGuard)
@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Post('create')
  async store(@Body() dto: CreateCustomerDto) {
    try {
      return await this.customerService.createCustomer(dto);
    } catch (error) {
      throw error;
    }
  }

  @Get('list')
  async index() {
    try {
      return await this.customerService.getAllCustomers();
    } catch (error) {
      throw error;
    }
  }

  @Get('show/:id')
  async show(@Param('id') id: string) {
    try {
      return await this.customerService.getCustomerById(Number(id));
    } catch (error) {
      throw error;
    }
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: CreateCustomerDto) {
    try {
      return await this.customerService.updateCustomer(Number(id), dto);
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    try {
      return await this.customerService.deleteCustomer(Number(id));
    } catch (error) {
      throw error;
    }
  }
}
