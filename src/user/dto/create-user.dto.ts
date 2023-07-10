import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
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

  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  @IsString()
  readonly password: string;

  @IsNotEmpty({
    message: 'Existe um campo obrigatório ausente! Verifique novamente.',
  })
  @IsString()
  readonly confirmPassword: string;
}
