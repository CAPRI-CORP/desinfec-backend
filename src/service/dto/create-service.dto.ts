import { IsNotEmpty, IsString } from 'class-validator';

export class CreateServiceDto {
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
}
