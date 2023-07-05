import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSchedulingDto {
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsArray()
  @IsNotEmpty()
  serviceId: number[];

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  observations: string;

  @IsString()
  @IsNotEmpty()
  cost: string;

  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  initialTime: string;

  @IsNotEmpty()
  conslusionTime: string;
}
