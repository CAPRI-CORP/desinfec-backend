import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExpensesDto {
  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  name: string;

  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  cost: string;

  @Type(() => Date)
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  date: Date;
}
