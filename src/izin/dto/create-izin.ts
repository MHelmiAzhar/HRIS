import { IsString } from "class-validator";
import { User } from "src/schemas/user.schema";



export class CreateIzinDto {

    // @IsString()
    izin: string;

    // @IsString()
    fromdate: Date;

    // @IsString()
    untildate: Date;

    // file: Buffer;

    // @IsString()
    description: string;

    user: User;

}