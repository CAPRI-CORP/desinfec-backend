import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class LoggedUserDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @IsNotEmpty()
  @IsString()
  readonly firstname: string;

  @IsNotEmpty()
  @IsString()
  readonly lastname: string;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @IsEmail()
  @IsString()
  readonly email: string;
}
