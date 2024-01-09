import { Category } from "src/schemas/cuti.schema";
import { IUser } from "./interface.user";


export interface ICuti {

    cuti: string;

    approval: Category;

    fromdate: Date;

    date: Date;

    untildate: Date;

    file: string;

    description: string;

    user: IUser;



}

