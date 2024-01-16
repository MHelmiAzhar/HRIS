import { Category } from 'src/schemas/izin.schema';
import { IUser } from './interface.user';

export interface IIzin {
  izin: string;

  approval: Category;

  fromdate: string;

  date: Date;

  untildate: string;

  file: string;

  description: string;

  user: IUser;
}
