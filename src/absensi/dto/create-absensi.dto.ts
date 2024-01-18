import { IsDate, IsString } from 'class-validator';
import { IUser } from 'src/interface/interface.user';
import { Category1 } from 'src/schemas/absensi.schema';

export class CreateAbsensiDto {
  // @IsString()
  absen: Category1;

  // @IsString()
  checkin: string;

  // @IsDate()
  date: string;

  image: Buffer;

  user: IUser;
}
