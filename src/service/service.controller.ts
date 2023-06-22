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
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post('create')
  async store(@Body() dto: CreateServiceDto) {
    try {
      return await this.serviceService.createService(dto);
    } catch (error) {
      throw error;
    }
  }

  @Get('list')
  async index() {
    try {
      return await this.serviceService.getAllService();
    } catch (error) {
      throw error;
    }
  }

  @Get('show/:id')
  async show(@Param('id') id: string) {
    try {
      return await this.serviceService.getServiceById(Number(id));
    } catch (error) {
      throw error;
    }
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.serviceService.updateService(Number(id), dto);
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    try {
      return await this.serviceService.deleteService(Number(id));
    } catch (error) {
      throw error;
    }
  }
}
