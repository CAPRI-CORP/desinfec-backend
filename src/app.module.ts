import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from './customer/customer.module';
import { ServiceModule } from './service/service.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CustomerModule,
    ServiceModule,
    SchedulingModule,
    ExpensesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
