import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { Izin } from 'src/schemas/izin.schema';
import { User } from 'src/schemas/user.schema';
import { UpdateIzinDto } from './dto/update-izin.dto';
import { MinioClientService } from 'src/minio/minio-client.service';
import { BufferedFile } from 'src/minio/file.model';

@Injectable()
export class IzinService {
    constructor(
        @InjectModel(Izin.name)
        private izinModel: Model<Izin>,
        private minioClientService: MinioClientService,


    ) { }


    async findAll(query: Query): Promise<any> {
        const resPerPage = 10;
        const currentPage = Number(query.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        let totalData = 0;
        let izin = [];

        if (!query.page && !query.keyword) {
            totalData = await this.izinModel.countDocuments().exec();
            izin = await this.izinModel.find().sort({ createdAt: -1 }).skip(skip).limit(resPerPage).exec();

        } else if (query.startDate && query.endDate) {
            const startDate = new Date(query.startDate as string);
            const endDate = new Date(query.endDate as string);

            endDate.setDate(endDate.getDate() + 1);

            totalData = await this.izinModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }).exec();
            izin = await this.izinModel.find({ createdAt: { $gte: startDate, $lte: endDate } }).sort({ createdAt: 1 }).skip(skip).limit(resPerPage).exec();

        } else {
            const keywordFilter = query.keyword ? {
                $or: [
                    { 'user.name': { $regex: query.keyword, $options: 'i' } },
                    { 'user.divisi': { $regex: query.keyword, $options: 'i' } },
                    { 'izin': { $regex: query.keyword, $options: 'i' } },
                    { 'type': { $regex: query.keyword, $options: 'i' } },
                    { 'approval': { $regex: query.keyword, $options: 'i' } },
                ],
            } : {};

            totalData = await this.izinModel.countDocuments({ $and: [{ ...keywordFilter }] }).exec();
            izin = await this.izinModel.find({ ...keywordFilter }).sort({ createdAt: -1 }).skip(skip).limit(resPerPage).exec();
        }

        if (query.page === 'all' && !query.keyword && !query.startDate && !query.endDate) {
            izin = await this.izinModel.find().sort({ createdAt: -1 }).exec();
            return { izin, totalPages: 1 };
        } else if (query.page === 'all' && query.keyword) {
            izin = await this.izinModel.find({
                $or: [
                    { 'user.name': { $regex: query.keyword, $options: 'i' } },
                    { 'user.divisi': { $regex: query.keyword, $options: 'i' } },
                    { 'izin': { $regex: query.keyword, $options: 'i' } },
                    { 'type': { $regex: query.keyword, $options: 'i' } },
                    { 'approval': { $regex: query.keyword, $options: 'i' } },
                ],
            }).sort({ createdAt: -1 }).exec();
            return { izin, totalPages: 1 };

        } else if (query.page === 'all' && query.startDate && query.endDate) {
            const startDate = new Date(query.startDate as string);
            const endDate = new Date(query.endDate as string);
            izin = await this.izinModel.find({ date: { $gte: startDate, $lte: endDate } }).exec();
            return { izin, totalPages: 1 };
        }

        const totalPages = Math.ceil(totalData / resPerPage);

        return { izin, totalPages };
    }


    async createIzin(izin: any, user: User, image: BufferedFile,): Promise<Izin> {
        const Time = new Date();

        let uploaded_image = await this.minioClientService.upload(image)


        const data = Object.assign(izin, {
            user: {
                id: user._id,
                name: user.name,
                divisi: user.divisi,
                position: user.position,
            },
            date: Time,
            approval: 'Wait For Response',
            file: uploaded_image.url, // Assuming your schema has a field 'imageUrl'
        });

        const res = await this.izinModel.create(data);
        return res;
    }



    async findIzinByUserId(id: string, query: Query): Promise<Izin[]> {

        const resPerPage = 10
        const currentPage = Number(query.page) || 1
        const skip = resPerPage * (currentPage - 1)
        // Menggunakan metode `find` untuk mencari izin berdasarkan ID pengguna
        return this.izinModel.find({ 'user._id': id }).sort({ createdAt: -1 }).limit(resPerPage).skip(skip).exec();
    }


    async updateApproved(id: string, updateIzinDto: UpdateIzinDto): Promise<Izin> {
        const izin = await this.izinModel.findById(id);

        if (!izin) {
            throw new HttpException('Izin not found', HttpStatus.NOT_FOUND);
        }
        // Pastikan bahwa "approval" ada dalam data yang dikirim dari frontend
        if (!updateIzinDto.approval) {
            throw new HttpException('Invalid data: "approval" field is missing', HttpStatus.BAD_REQUEST);
        }

        // Setel nilai "approval" ke entitas "izin"
        izin.approval = updateIzinDto.approval;

        // Simpan perubahan ke database
        const updatedIzin = await izin.save();

        return updatedIzin;
    }


    // async checkIzinExist(user: User, date: string): Promise<boolean> {
    //     const existingIzin = await this.izinModel
    //       .findOne({
    //         user: user._id,
    //         date, // Gantilah dengan cara Anda menyimpan tanggal
    //       })
    //       .exec();

    //     return !!existingIzin;
    //   }


}
