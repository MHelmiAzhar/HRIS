import { IUser } from "./interface.user";
import { Category, Category1 } from "src/schemas/absensi.schema";


export interface IAbsensi {


    absen: Category1;

    checkin: string;

    checkout: Date;

    file: string;

    date: Date;

    type: Category;

    user: IUser;

}

