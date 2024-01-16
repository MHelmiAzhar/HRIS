import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { Form } from 'src/schemas/form.schema';
import { User } from 'src/schemas/user.schema';
import { UpdateFormDto } from './dto/update-form.dto';
import { BufferedFile } from 'src/minio/file.model';
import { MinioClientService } from 'src/minio/minio-client.service';

@Injectable()
export class FormService {
  constructor(
    @InjectModel(Form.name)
    private formModel: Model<Form>,
    private minioClientService: MinioClientService,
  ) {}

  async findAll(query: Query): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    let totalData = 0;
    let form = [];

    if (!query.page && !query.keyword) {
      totalData = await this.formModel.countDocuments().exec();
      form = await this.formModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(resPerPage)
        .exec();
    } else if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate as string);
      const endDate = new Date(query.endDate as string);

      endDate.setDate(endDate.getDate() + 1);

      totalData = await this.formModel
        .countDocuments({ date: { $gte: startDate, $lte: endDate } })
        .exec();
      form = await this.formModel
        .find({ date: { $gte: startDate, $lte: endDate } })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(resPerPage)
        .exec();
    } else {
      const keywordFilter = query.keyword
        ? {
            $or: [
              { 'user.name': { $regex: query.keyword, $options: 'i' } },
              { 'user.divisi': { $regex: query.keyword, $options: 'i' } },
              { approval: { $regex: query.keyword, $options: 'i' } },
              { title: { $regex: query.keyword, $options: 'i' } },
              { name: { $regex: query.keyword, $options: 'i' } },
            ],
          }
        : {};

      totalData = await this.formModel
        .countDocuments({ $and: [{ ...keywordFilter }] })
        .exec();
      form = await this.formModel
        .find({ ...keywordFilter })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(resPerPage)
        .exec();
    }

    if (
      query.page === 'all' &&
      !query.keyword &&
      !query.startDate &&
      !query.endDate
    ) {
      form = await this.formModel.find().sort({ createdAt: -1 }).exec();
      return { form, totalPages: 1 };
    } else if (query.page === 'all' && query.keyword) {
      form = await this.formModel
        .find({
          $or: [
            { 'user.name': { $regex: query.keyword, $options: 'i' } },
            { 'user.divisi': { $regex: query.keyword, $options: 'i' } },
            { approval: { $regex: query.keyword, $options: 'i' } },
            { title: { $regex: query.keyword, $options: 'i' } },
            { name: { $regex: query.keyword, $options: 'i' } },
          ],
        })
        .sort({ createdAt: -1 })
        .exec();
      return { form, totalPages: 1 };
    } else if (query.page === 'all' && query.startDate && query.endDate) {
      const startDate = new Date(query.startDate as string);
      const endDate = new Date(query.endDate as string);
      form = await this.formModel
        .find({ date: { $gte: startDate, $lte: endDate } })
        .exec();
      return { form, totalPages: 1 };
    }

    const totalPages = Math.ceil(totalData / resPerPage);

    return { form, totalPages };
  }

  async createForm(form: any, user: User, image: BufferedFile): Promise<Form> {
    const userId = user._id;
    const Time = new Date();

    let uploaded_image = await this.minioClientService.upload(image, userId);

    const data = Object.assign(form, {
      user: {
        id: user._id,
        name: user.name,
      },
      date: Time,
      approval: 'Wait For Response',
      file: uploaded_image.url,
    });

    const res = await this.formModel.create(data);
    return res;
  }

  async updateForm(id: string, updateFormDto: UpdateFormDto): Promise<Form> {
    const form = await this.formModel.findById(id);

    if (!form) {
      throw new HttpException('Form not found', HttpStatus.NOT_FOUND);
    }
    // Pastikan bahwa "checkout" ada dalam data yang dikirim dari frontend
    if (!updateFormDto.approval) {
      throw new HttpException(
        'Invalid data: "checkout" field is missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Setel properti "checkout" dengan nilai yang baru
    form.approval = updateFormDto.approval; // Pastikan konversi ke tipe Date jika perlu

    // Simpan perubahan ke database
    const updatedForm = await form.save();

    return updatedForm;
  }

  async deleteById(id: string): Promise<Form> {
    return await this.formModel.findByIdAndDelete(id, {});
  }

  async findFormByUserId(id: string, query: Query): Promise<Form[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    return this.formModel
      .find({ 'user._id': id })
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }

  // async uploadSingle(image: BufferedFile) {
  //   let uploaded_image = await this.minioClientService.upload(image);

  //   const newUpload = new this.formModel({
  //     file: uploaded_image.url,
  //   });

  //   await newUpload.save();

  //   return {
  //     image_url: uploaded_image.url,
  //     message: 'Successfully uploaded to MinIO S3 and saved to the database',
  //   };
  // }
}
