import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSchedulingDto {
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  observations: string;

  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  initialTime: string;

  @IsNotEmpty()
  conslusionTime: string;
}
