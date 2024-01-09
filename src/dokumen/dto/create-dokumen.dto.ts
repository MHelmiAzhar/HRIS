import { User } from "src/schemas/user.schema";

export class CreateDokumenDto {

    title: string;

    file: Buffer;

    user: User;

}

