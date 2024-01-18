import { IsString } from 'class-validator';
import { IUser } from 'src/interface/interface.user';

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

  user: IUser;
}
