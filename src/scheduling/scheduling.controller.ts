import { SchedulingService } from './scheduling.service';
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
import { CreateSchedulingDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Schedulings')
@UseGuards(JwtGuard)
@Controller('schedulings')
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  @Post('create')
  async store(@Body() dto: CreateSchedulingDto) {
    try {
      return await this.schedulingService.create(dto);
    } catch (error) {
      throw error;
    }
  }

  @Get('list')
  async index(
    @Param('initialDate') initialdate: string | null,
    @Param('finalDate') finaldate: string | null,
  ) {
    try {
      return await this.schedulingService.getAllSchedulings(
        initialdate,
        finaldate,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('show/:id')
  async show(@Param('id') id: string) {
    try {
      return await this.schedulingService.getSchedulingById(Number(id));
    } catch (error) {
      throw error;
    }
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: CreateSchedulingDto) {
    try {
      return await this.schedulingService.updateScheduling(Number(id), dto);
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    try {
      return await this.schedulingService.deleteScheduling(Number(id));
    } catch (error) {
      throw error;
    }
  }
}
