import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BufferedFile } from 'src/minio/file.model';
import { MinioClientService } from 'src/minio/minio-client.service';
import { Dokumen } from 'src/schemas/dokumen.schema';
import { Upload } from 'src/schemas/upload.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class DokumenService {
  constructor(
    @InjectModel(Dokumen.name)
    private dokumenModel: Model<Dokumen>,
    private minioClientService: MinioClientService

  ) { }

  async getAllDokumen() {
    return await this.dokumenModel.find().exec();
  }

  async createDokumen(dokumen: any, user: User, image: BufferedFile): Promise<Dokumen> {

    let uploaded_image = await this.minioClientService.upload(image)


    const data = Object.assign(dokumen, {
      user: {
        id: user._id,
        name: user.name,
      },
      file: uploaded_image.url,

    });

    console.log(uploaded_image.url);

    const res = await this.dokumenModel.create(data);
    return res;
  }

  async uploadSingle(image: BufferedFile) {
    let uploaded_image = await this.minioClientService.upload(image)

    const newUpload = new this.dokumenModel({
      file: uploaded_image.url,
    });

    await newUpload.save();

    return {
      image_url: uploaded_image.url,
      message: "Successfully uploaded to MinIO S3 and saved to the database"
    }
  }
}
