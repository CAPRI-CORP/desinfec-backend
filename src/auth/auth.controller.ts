import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AuthDto, RecoveryEmailDto } from './dto';
import { RecoveryPasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    try {
      return this.authService.signin(dto);
    } catch (err) {
      return { message: err.message };
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('recovery-email')
  recoveryEmail(@Body() dto: RecoveryEmailDto) {
    try {
      return this.authService.sendPasswordRecoveryEmail(dto);
    } catch (err) {
      return { message: err.message };
    }
  }

  @Post('change-password')
  changePassword(
    @Query('token') token: string,
    @Body() dto: RecoveryPasswordDto,
  ) {
    try {
      return token;
      return this.authService.changePassword(1, token, dto);
    } catch (err) {
      return { message: err.message };
    }
  }
}
