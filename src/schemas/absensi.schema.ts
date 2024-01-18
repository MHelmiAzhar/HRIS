import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Document } from 'mongoose';
import { IAbsensi } from 'src/interface/interface.absensi';
import { IUser } from 'src/interface/interface.user';

export enum Category1 {
  WFO = 'Work From Office', //status
  WFH = 'Work Form Home',
}

export enum Category {
  Present = 'Present', //type
  Late = 'Late',
  Absent = 'Absent',
}

@Schema({
  timestamps: true,
})
export class Absensi extends Document implements IAbsensi {
  @Prop()
  absen: Category1;

  @Prop()
  date: Date;

  @Prop()
  checkin: string;

  @Prop()
  checkout: Date;

  @Prop()
  file: string;

  @Prop()
  type: Category;

  @Prop()
  user: IUser;
}

export const AbsensiSchema = SchemaFactory.createForClass(Absensi);
