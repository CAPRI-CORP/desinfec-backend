import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class LoggedUserDto {
  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  @IsNumber()
  readonly id: number;

  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  @IsString()
  readonly firstname: string;

  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  @IsString()
  readonly lastname: string;

  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  @IsString()
  readonly phone: string;

  @IsEmail({}, { message: 'Campo necessita ser do tipo EMAIL!' })
  @IsString()
  readonly email: string;
}
