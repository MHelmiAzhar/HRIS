import { Category, Category1 } from "src/schemas/form.schema";
import { IUser } from "./interface.user";


export interface IForm {

    category: Category1;

    approval: Category;

    title: string;

    date: Date;

    chronology: string;

    damage: string;

    name: string;

    reason: string;

    cost: string;

    upload: string;

    user: IUser;

}

