import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { Document } from "mongoose";
import { IForm } from "src/interface/interface.form";


export enum Category1 {
    Repair = 'Repair',
    Purchase = 'Purchase'
}

export enum Category {
    Wait_For_Response = 'Wait For Response',
    Approved = 'Approved',
    Reject = 'Rejected'
}


@Schema({
    timestamps: true,
})
export class Form extends Document implements IForm {

    @Prop()
    category: Category1;

    @Prop()
    approval: Category;

    @Prop()
    title: string;

    @Prop()
    date: Date;

    @Prop()
    chronology: string;

    @Prop()
    damage: string;

    @Prop()
    name: string;

    @Prop()
    reason: string;

    @Prop()
    cost: string;

    @Prop()
    upload: string;

    @Prop()
    user: User;

}

export const FormSchema = SchemaFactory.createForClass(Form);