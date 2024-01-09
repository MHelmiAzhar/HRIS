import { IsString } from "class-validator";
import { Category } from "src/schemas/cuti.schema";



export class UpdateCutiDto {

    // @IsString()
    approval: Category;


}