import { IsEmail, IsNotEmpty } from 'class-validator';

const errorMessage = 'E-mail não encontrado, verifique novamente!';

export class RecoveryEmailDto {
  @IsEmail({}, { message: errorMessage })
  @IsNotEmpty({ message: errorMessage })
  readonly email: string;
}
