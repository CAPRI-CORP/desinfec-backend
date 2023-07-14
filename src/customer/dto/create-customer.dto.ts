import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  firstname: string;

  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  lastname: string;

  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  phone: string;

  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  state: string;

  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  city: string;

  @IsString()
  @IsOptional()
  zipcode: string;

  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  neighborhood: string;

  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  street: string;

  @IsString()
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  number: string;

  @IsString()
  @IsOptional()
  complement: string | null;

  @IsString()
  @IsOptional()
  reference: string | null;

  @IsNumber()
  categoryId: number;
}
