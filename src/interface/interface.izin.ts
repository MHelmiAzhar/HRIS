import { Category } from "src/schemas/izin.schema";
import { IUser } from "./interface.user";


export interface IIzin {

    izin: string;

    approval: Category;

    fromdate: Date;

    date: Date;
    
    untildate: Date;

    file: string;

    description: string;

    user: IUser;

}

