import { IsString } from "class-validator";



export class UpdateAbsensiDto {

    @IsString()
    checkout: string;



}