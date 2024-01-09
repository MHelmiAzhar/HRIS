import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { Document } from "mongoose";
import { IDokumen } from "src/interface/interface.dokumen";



@Schema({
    timestamps: true,
})
export class Dokumen extends Document implements IDokumen {

    @Prop()
    title: string;

    @Prop()
    file: Buffer;

    @Prop()
    user: User;

}

export const DokumenSchema = SchemaFactory.createForClass(Dokumen);