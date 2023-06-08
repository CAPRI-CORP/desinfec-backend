import { Module } from '@nestjs/common';
import { AuthControllerController } from './auth.controller/auth.controller.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthControllerController, AuthController],
  providers: [AuthService]
})
export class AuthModule {}
