import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { AuthDto, RecoveryEmailDto } from './dto';
import { RecoveryPasswordDto } from './dto/change-password.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
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

  @Put('change-password')
  changePassword(@Body() dto: RecoveryPasswordDto) {
    try {
      return this.authService.changePassword(dto);
    } catch (err) {
      return { message: err.message };
    }
  }
}
