import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ICuti } from 'src/interface/interface.cuti';
import { IUser } from 'src/interface/interface.user';

export enum Category {
  Wait_For_Response = 'Wait For Response',
  Approved = 'Approved',
  Reject = 'Reject',
}

export enum Category1 {
  Leave = 'Leave',
}

@Schema({
  timestamps: true,
})
export class Cuti extends Document implements ICuti {
  @Prop()
  cuti: string;

  @Prop()
  approval: Category;

  @Prop()
  fromdate: Date;

  @Prop()
  date: Date;

  @Prop()
  untildate: Date;

  @Prop()
  file: string;

  @Prop()
  description: string;

  @Prop()
  type: Category1;

  @Prop()
  user: IUser;
}

export const CutiSchema = SchemaFactory.createForClass(Cuti);
