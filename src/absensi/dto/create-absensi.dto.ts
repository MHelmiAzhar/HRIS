import { IsDate, IsString } from "class-validator";
import { Category1 } from "src/schemas/absensi.schema";
import { User } from "src/schemas/user.schema";



export class CreateAbsensiDto {

    // @IsString()
    absen: Category1;

    // @IsString()
    checkin: string;

    // @IsDate()
    date: string;

    image: Buffer;

    user: User;

}