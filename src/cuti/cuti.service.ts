import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { Cuti } from 'src/schemas/cuti.schema';
import { User } from 'src/schemas/user.schema';
import { UpdateCutiDto } from './dto/update-cuti.dto';
import { MinioClientService } from 'src/minio/minio-client.service';
import { BufferedFile } from 'src/minio/file.model';

@Injectable()
export class CutiService {
  constructor(
    @InjectModel(Cuti.name)
    private cutiModel: Model<Cuti>,
    private minioClientService: MinioClientService,

    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findAll(query: Query): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    let totalData = 0;
    let cuti = [];

    if (!query.page && !query.keyword) {
      totalData = await this.cutiModel.countDocuments().exec();
      cuti = await this.cutiModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(resPerPage)
        .exec();
    } else if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate as string);
      const endDate = new Date(query.endDate as string);

      endDate.setDate(endDate.getDate() + 1);

      totalData = await this.cutiModel
        .countDocuments({ createdAt: { $gte: startDate, $lte: endDate } })
        .exec();
      cuti = await this.cutiModel
        .find({ createdAt: { $gte: startDate, $lte: endDate } })
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
              { cuti: { $regex: query.keyword, $options: 'i' } },
              { type: { $regex: query.keyword, $options: 'i' } },
              { approval: { $regex: query.keyword, $options: 'i' } },
            ],
          }
        : {};

      totalData = await this.cutiModel
        .countDocuments({ $and: [{ ...keywordFilter }] })
        .exec();
      cuti = await this.cutiModel
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
      cuti = await this.cutiModel.find().sort({ createdAt: -1 }).exec();
      return { cuti, totalPages: 1 };
    } else if (query.page === 'all' && query.keyword) {
      cuti = await this.cutiModel
        .find({
          $or: [
            { 'user.name': { $regex: query.keyword, $options: 'i' } },
            { 'user.divisi': { $regex: query.keyword, $options: 'i' } },
            { cuti: { $regex: query.keyword, $options: 'i' } },
            { type: { $regex: query.keyword, $options: 'i' } },
            { approval: { $regex: query.keyword, $options: 'i' } },
          ],
        })
        .sort({ createdAt: -1 })
        .exec();
      return { cuti, totalPages: 1 };
    } else if (query.page === 'all' && query.startDate && query.endDate) {
      const startDate = new Date(query.startDate as string);
      const endDate = new Date(query.endDate as string);
      cuti = await this.cutiModel
        .find({ date: { $gte: startDate, $lte: endDate } })
        .exec();
      return { cuti, totalPages: 1 };
    }

    const totalPages = Math.ceil(totalData / resPerPage);

    return { cuti, totalPages };
  }

  calculateDateDifference(fromDate: Date, untilDate: Date): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const timeDifference = untilDate.getTime() - fromDate.getTime();
    const totalDays = Math.floor(timeDifference / millisecondsPerDay);

    return totalDays;
  }

  async createCuti(cuti: any, user: User, image: BufferedFile): Promise<Cuti> {
    const currentDate = new Date();
    const userId = user._id;
    let uploaded_image;
    if (image) {
      uploaded_image = await this.minioClientService.upload(image, userId);
    }

    const fromDate = new Date(cuti.fromdate);
    let untilDate = new Date(cuti.untildate);
    untilDate?.setDate(untilDate.getDate() + 1);

    const totalDays = this.calculateDateDifference(fromDate, untilDate);

    // Cek apakah pengguna memiliki sisa cuti dari bulan sebelumnya
    const userDetail = await this.userModel.findById(user._id);
    if (userDetail.remainingCuti > 0) {
      // Jika tidak ada sisa cuti dari bulan sebelumnya, buat entri cuti baru
      const data = Object.assign(cuti, {
        user: {
          id: user._id,
          name: user.name,
          divisi: user.divisi,
          position: user.position,
        },
        date: currentDate,
        approval: 'Wait For Response',
        file: uploaded_image?.url || '', // Assuming your schema has a field 'imageUrl'
      });

      const res = await this.cutiModel.create(data);
      return res;
    } else {
      throw new HttpException('RemainingCuti not found', HttpStatus.NOT_FOUND);
    }
  }

  async findCutiByUserId(id: string, query: Query): Promise<Cuti[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    return this.cutiModel
      .find({ 'user._id': id })
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }

  async updateApproved(
    id: string,
    updateCutiDto: UpdateCutiDto,
  ): Promise<Cuti> {
    const cuti = await this.cutiModel.findById(id);

    if (!cuti) {
      throw new HttpException('Cuti not found', HttpStatus.NOT_FOUND);
    }
    // Pastikan bahwa "approval" ada dalam data yang dikirim dari frontend
    if (!updateCutiDto.approval) {
      throw new HttpException(
        'Invalid data: "approval" field is missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userDetail = await this.userModel.findById(cuti.user._id);
    if (!userDetail) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Setel nilai "approval" ke entitas "cuti"
    cuti.approval = updateCutiDto.approval;

    const fromDate = new Date(cuti.fromdate);
    let untilDate = new Date(cuti.untildate);
    untilDate?.setDate(untilDate.getDate() + 1);

    const totalDays = this.calculateDateDifference(fromDate, untilDate);
    console.log(totalDays);

    if (userDetail.remainingCuti - totalDays < 0) {
      throw new HttpException(
        'Not enough remaining cuti',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kurangi remainingCuti dengan total hari cuti yang diambil
    userDetail.remainingCuti -= totalDays;

    await userDetail.save();

    // Simpan perubahan ke database
    const updatedCuti = await cuti.save();

    return updatedCuti;
  }
}
