import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateExpensesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cost: string;

  @IsDate()
  @IsNotEmpty()
  date: Date;
}
