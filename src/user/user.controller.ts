import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Users')
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async store(@Body() dto: CreateUserDto) {
    try {
      return await this.userService.createUser(dto);
    } catch (error) {
      throw error;
    }
  }

  @Get('list')
  async index(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('name') name: string | null,
  ) {
    try {
      return await this.userService.getUsers(Number(page), Number(limit), name);
    } catch (error) {
      throw error;
    }
  }

  @Get('show/:id')
  async show(@Param('id') id: string) {
    try {
      return await this.userService.getUserById(Number(id));
    } catch (error) {
      throw error;
    }
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: CreateUserDto) {
    try {
      return await this.userService.updateUser(Number(id), dto);
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    try {
      return await this.userService.deleteUser(Number(id));
    } catch (error) {
      throw error;
    }
  }
}
