import { IUser } from 'src/interface/interface.user';

export class CreateDokumenDto {
  title: string;

  file: Buffer;

  user: IUser;
}
