import { IsString } from "class-validator";
import { User } from "src/schemas/user.schema";



export class CreateCutiDto {

    // @IsString()
    cuti: string;

    // @IsString()
    fromdate: Date;

    // @IsString()
    untildate: Date;

    file: Buffer;

    // @IsString()
    description: string;

    user: User;

    remainingCuti: number;

}