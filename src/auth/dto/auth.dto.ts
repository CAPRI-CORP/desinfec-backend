import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

const errorMessage = 'E-mail ou Senha não encontrados, verifique novamente!';

export class AuthDto {
  @IsEmail({}, { message: errorMessage })
  @IsNotEmpty({ message: errorMessage })
  readonly email: string;

  @IsString({ message: errorMessage })
  @IsNotEmpty({ message: errorMessage })
  readonly password: string;
}
