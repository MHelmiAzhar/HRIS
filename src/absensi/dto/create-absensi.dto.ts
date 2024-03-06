import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsString } from 'class-validator';
import { IUser } from 'src/interface/interface.user';
import { Category1 } from 'src/schemas/absensi.schema';

export class CreateAbsensiDto {
  @IsEnum(Category1)
  absen: Category1;

  image: Buffer;

  checkin: string;

  // @IsDate()
  date: string;

  user: IUser;
}
