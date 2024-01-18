import { IsString } from 'class-validator';
import { IUser } from 'src/interface/interface.user';

export class CreateCutiDto {
  // @IsString()
  cuti: string;

  // @IsString()
  fromdate: Date;

  // @IsString()
  untildate: Date;

  file: Buffer;

  // @IsString()
  description: string;

  user: IUser;

  remainingCuti: number;
}
