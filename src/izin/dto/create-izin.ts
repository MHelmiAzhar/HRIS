import { IsString } from 'class-validator';
import { User } from 'src/schemas/user.schema';

export class CreateIzinDto {
  // @IsString()
  izin: string;

  // @IsString()
  fromdate: string;

  // @IsString()
  untildate: string;

  // file: Buffer;

  // @IsString()
  description: string;

  user: User;
}
