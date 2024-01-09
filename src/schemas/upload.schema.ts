import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema({
    timestamps: true,
})
export class Upload {

    @Prop()
    imageUrl: string;

}

export const UploadSchema = SchemaFactory.createForClass(Upload)