import { IsString } from "class-validator";
import { Category, Category1 } from "src/schemas/form.schema";
import { User } from "src/schemas/user.schema";




export class CreateFormRepairDto {

    category: Category1;

    approval: Category;

    // @IsString()
    title: string;

    date: Date;

    // @IsString()
    chronology: string;

    // @IsString()
    damage: string;

    // @IsString()
    cost: string;

    upload: Buffer;

    user: User;

}