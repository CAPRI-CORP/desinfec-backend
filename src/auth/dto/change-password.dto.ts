import { IsNotEmpty, IsString } from 'class-validator';

const errorMessage =
  'A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.';

export class RecoveryPasswordDto {
  @IsString({ message: errorMessage })
  @IsNotEmpty({ message: errorMessage })
  readonly password: string;

  @IsString({ message: errorMessage })
  @IsNotEmpty({ message: errorMessage })
  readonly confirmPassword: string;

  @IsString({ message: 'Token inválido!' })
  @IsNotEmpty({ message: 'Token inválido!' })
  readonly token: string;
}
