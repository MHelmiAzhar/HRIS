import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'please enter correct email' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  address: string;

  @IsPhoneNumber('ID')
  numberphone: number;

  @IsString()
  divisi: string;

  @IsString()
  position: string;
}
