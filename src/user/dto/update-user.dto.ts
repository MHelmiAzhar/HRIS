import { IsString } from 'class-validator';

export class UpdateUserDto {

    @IsString()
    name: string;

    @IsString()
    password: string;

    @IsString()
    address: string;

    @IsString()
    divisi: string;

    @IsString()
    position: string;

}
