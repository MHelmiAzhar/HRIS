import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Document } from 'mongoose';
import { IDokumen } from 'src/interface/interface.dokumen';
import { IUser } from 'src/interface/interface.user';

@Schema({
  timestamps: true,
})
export class Dokumen extends Document implements IDokumen {
  @Prop()
  title: string;

  @Prop()
  file: Buffer;

  @Prop()
  user: IUser;
}

export const DokumenSchema = SchemaFactory.createForClass(Dokumen);
