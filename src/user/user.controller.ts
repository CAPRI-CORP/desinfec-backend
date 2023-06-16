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
import { UserService } from './user.service';
import { CreateUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async store(@Body() dto: CreateUserDto) {
    try {
      return await this.userService.createUser(dto);
    } catch (error) {
      return error.message;
    }
  }

  @Get('list')
  async index() {
    try {
      return await this.userService.getUsers();
    } catch (error) {
      return error.message;
    }
  }

  @Get('show/:id')
  async show(@Param('id') id: string) {
    try {
      return await this.userService.getUserById(Number(id));
    } catch (error) {
      return error.message;
    }
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: CreateUserDto) {
    try {
      return await this.userService.updateUser(Number(id), dto);
    } catch (error) {
      return error.message;
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    try {
      return await this.userService.deleteUser(Number(id));
    } catch (error) {
      return error.message;
    }
  }
}
