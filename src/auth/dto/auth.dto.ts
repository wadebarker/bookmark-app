import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
