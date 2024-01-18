import { IsString } from 'class-validator';
import { IUser } from 'src/interface/interface.user';
import { Category, Category1 } from 'src/schemas/form.schema';

export class CreateFormPurchaseDto {
  category: Category1;

  approval: Category;

  // @IsString()
  title: string;

  date: Date;

  // @IsString()
  name: string;

  // @IsString()
  reason: string;

  // @IsString()
  cost: string;

  upload: Buffer;

  user: IUser;
}
