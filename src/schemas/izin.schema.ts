import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { Document } from "mongoose";
import { IIzin } from "src/interface/interface.izin";

export enum Category {
    Wait_For_Response = 'Wait For Response',
    Approved = 'Approved',
    Reject = 'Reject'
}

export enum Category1 {
    Permission = 'Permission',
}



@Schema({
    timestamps: true,
})

export class Izin extends Document implements IIzin {

    @Prop()
    izin: string;

    @Prop()
    approval: Category;

    @Prop()
    fromdate: Date;

    @Prop()
    date: Date;

    @Prop()
    untildate: Date;

    @Prop()
    file: string;

    @Prop()
    description: string;

    @Prop()
    type: Category1;

    @Prop()
    user: User;

}

export const IzinSchema = SchemaFactory.createForClass(Izin);