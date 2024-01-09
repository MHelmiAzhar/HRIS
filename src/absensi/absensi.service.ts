import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Absensi } from 'src/schemas/absensi.schema';
import { Query } from 'express-serve-static-core';
import { User } from 'src/schemas/user.schema';
import { BufferedFile } from 'src/minio/file.model';
import { MinioClientService } from 'src/minio/minio-client.service';
import { UpdateAbsensiDto } from './dto/update-absen.dto';
import { UserService } from 'src/user/user.service';
import { format } from 'date-fns';
import { Cron } from '@nestjs/schedule';
import { Cuti } from 'src/schemas/cuti.schema';
import { Izin } from 'src/schemas/izin.schema';
import axios from 'axios';



@Injectable()
export class AbsensiService {
  private readonly logger = new Logger(AbsensiService.name);
  constructor(
    @InjectModel(Absensi.name)
    private absensiModel: Model<Absensi>,
    private minioClientService: MinioClientService,
    private userService: UserService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Cuti.name) private cutiModel: Model<Cuti>,
    @InjectModel(Izin.name) private izinModel: Model<Izin>,


  ) { }

  async findAll(query: Query): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    let totalData = 0;
    let absensi = [];

    if (!query.page && !query.keyword) {
      totalData = await this.absensiModel.countDocuments().exec();
      absensi = await this.absensiModel.find().sort({ createdAt: -1 }).skip(skip).limit(resPerPage).exec();

    } else if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate as string);
      const endDate = new Date(query.endDate as string);

      endDate.setDate(endDate.getDate() + 1);

      totalData = await this.absensiModel.countDocuments({ date: { $gte: startDate, $lte: endDate } }).exec();
      absensi = await this.absensiModel.find({ date: { $gte: startDate, $lte: endDate } }).sort({ createdAt: 1 }).skip(skip).limit(resPerPage).exec();

    } else {
      const keywordFilter = query.keyword ? {
        $or: [
          { 'user.name': { $regex: query.keyword, $options: 'i' } },
          { 'user.divisi': { $regex: query.keyword, $options: 'i' } },
          { 'absen': { $regex: query.keyword, $options: 'i' } },
          { 'type': { $regex: query.keyword, $options: 'i' } },
        ],
      } : {};

      totalData = await this.absensiModel.countDocuments({ $and: [{ ...keywordFilter }] }).exec();
      absensi = await this.absensiModel.find({ ...keywordFilter }).sort({ createdAt: -1 }).skip(skip).limit(resPerPage).exec();
    }

    if (query.page === 'all' && !query.keyword && !query.startDate && !query.endDate) {
      absensi = await this.absensiModel.find().sort({ createdAt: -1 }).exec();
      return { absensi, totalPages: 1 };
    } else if (query.page === 'all' && query.keyword) {
      absensi = await this.absensiModel.find({
        $or: [
          { 'user.name': { $regex: query.keyword, $options: 'i' } },
          { 'user.divisi': { $regex: query.keyword, $options: 'i' } },
          { 'absen': { $regex: query.keyword, $options: 'i' } },
          { 'type': { $regex: query.keyword, $options: 'i' } },
        ],
      }).sort({ createdAt: -1 }).exec();
      return { absensi, totalPages: 1 };

    } else if (query.page === 'all' && query.startDate && query.endDate) {
      const startDate = new Date(query.startDate as string);
      const endDate = new Date(query.endDate as string);
      absensi = await this.absensiModel.find({ date: { $gte: startDate, $lte: endDate } }).exec();
      return { absensi, totalPages: 1 };
    }

    const totalPages = Math.ceil(totalData / resPerPage);

    return { absensi, totalPages };
  }

  // @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }


  async getHolidayData(): Promise<string[]> {
    const apiUrl = `https://dayoffapi.vercel.app/api`;
    try {
      const response = await axios.get(apiUrl);
      return response.data; // Data libur dari API
    } catch (error) {
      throw new Error('Gagal memuat data libur dari API');
    }
  }

  //done
  @Cron('51 20 * * *')
  async createAbsentDataForCurrentDay(): Promise<void> {
    const now = new Date();
    const time = format(now, 'yyyy-mm-dd');
    const currentDate = new Date(time);

    // Ambil semua pengguna kecuali admin
    const users = await this.userModel.find({ role: { $ne: "Admin" } }).exec();


    for (const user of users) {
      // Periksa data absensi, cuti, dan izin untuk pengguna pada tanggal tertentu
      const absensi = await this.absensiModel.findOne({ 'user._id': user._id, date: currentDate }).exec();
      const cuti = await this.cutiModel.findOne({ 'user._id': user._id, date: currentDate }).exec();
      const izin = await this.izinModel.findOne({ 'user._id': user._id, date: currentDate }).exec();

      // Jika pengguna sudah memiliki salah satu data (absensi, cuti, atau izin), lewati pengguna ini
      if (absensi || cuti || izin) {
        console.log(`Pengguna ${user.name} sudah memiliki data pada tanggal ${currentDate}`);
        continue; // Lewati ke pengguna berikutnya
      } else {

      }

      // Identifikasi apakah hari ini adalah hari Sabtu (6) atau Minggu (0)
      const isWeekend = now.getDay() === 6 || now.getDay() === 0;

      // Isi dengan tanggal-tanggal libur nasional
      const nationalHolidays = await this.getHolidayData(); 

      const isHoliday = nationalHolidays.includes(currentDate.toISOString().slice(0, 10));

      // Tentukan tipe berdasarkan apakah hari tersebut merupakan akhir pekan atau tidak
      const type = isWeekend || isHoliday ? 'Holiday' : 'Absent';

      // Ambil informasi pengguna dan status ke dalam dokumen Absensi jika tidak ada absensi, cuti, atau izin
      const newAbsensi = {
        user: {
          id: user._id,
          name: user.name,
          divisi: user.divisi,
          position: user.position,
        },
        date: currentDate,
        type: type,
      };

      // Simpan data baru jika absensi tidak ada
      const data = new this.absensiModel(newAbsensi);
      await data.save();
      console.log(`Data "${type}" ditambahkan untuk pengguna ${user.name} pada tanggal ${currentDate}`);
    }
  }


  async getAllDataSortedByDate(query: Query): Promise<{ data: any[], totalPages?: number }> {

    const page = Number(query.page) || 1;
    const perPage = query.perPage ? Number(query.perPage) : 10;
    const skip = perPage * (page - 1);


    const data1 = await this.absensiModel.find().lean();
    const data2 = await this.cutiModel.find().lean();
    const data3 = await this.izinModel.find().lean();
    // Retrieve data for Collection2 and Collection3 similarly...

    const allData = [...data1, ...data2, ...data3 /* Add data2 and data3 here... */];

    if (query.page === 'all') {
      return { data: allData };
    }

    // Sort allData by date
    allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalData = allData.length;
    const totalPages = Math.ceil(totalData / perPage);

    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    const paginatedData = allData.slice(startIndex, endIndex);

    return { data: paginatedData, totalPages };
  }



  async getAllUsersWhoHaveNotMarkedAttendanceToday() {
    const users = await this.userService.findAll({}); // Mengambil semua pengguna dari basis data
    const usersWithoutAttendance: User[] = [];
    const userIds = users.map(user => user._id);
    const absenTime = new Date(); // Membuat objek tanggal dan waktu saat ini

    for (const user of users) {
      const startOfToday = new Date(absenTime.getFullYear(), absenTime.getMonth(), absenTime.getDate(), 0, 0, 0); // Waktu mulai hari ini
      const endOfToday = new Date(absenTime.getFullYear(), absenTime.getMonth(), absenTime.getDate(), 23, 59, 59); // Waktu akhir hari ini

      // Mencari entri absensi untuk setiap pengguna pada hari itu
      const absensi = await this.absensiModel.find({
        'user.id': { $in: userIds }, // Sesuaikan dengan properti yang tepat untuk mencocokkan ID pengguna
        date: { $gte: startOfToday, $lte: endOfToday },
        type: { $in: ['Present', 'Late'] }
      });

      console.log(userIds);


      // Jika tidak ada entri absensi yang ditemukan, tandai pengguna sebagai belum absen
      if (!absensi || absensi.length === 0) {
        usersWithoutAttendance.push(user);
      }
    }

    return usersWithoutAttendance;
  }



  async createAbsensi(absensi: any, user: User, image: BufferedFile): Promise<Absensi> {

    const absenTime = new Date(); // Membuat objek tanggal dan waktu saat ini

    let uploaded_image = await this.minioClientService.upload(image)

    // Tentukan batas waktu untuk menganggap karyawan sebagai "telat" (misalnya, pukul 09:30)
    const lateBoundary = new Date(absenTime);
    lateBoundary.setHours(9, 30, 0, 0);

    // Tentukan batas waktu untuk menganggap karyawan sebagai "alfa" (misalnya, pukul 17:00)
    const absentBoundary = new Date(absenTime);
    absentBoundary.setHours(17, 0, 0, 0);

    // Inisialisasi status absensi
    let absensiStatus: string = 'Present';

    // Periksa apakah waktu absensi berada dalam batas waktu telat
    if (absenTime > lateBoundary && absenTime <= absentBoundary) {
      absensiStatus = 'Late';
    } else if (absenTime > absentBoundary) {
      absensiStatus = 'Absent';
    }

    // Menambahkan informasi pengguna dan status ke dokumen Absensi
    const data = Object.assign(absensi, {
      user: {
        id: user._id,      // ID pengguna
        name: user.name,    // Nama pengguna (sesuai dengan properti yang ada di objek User)
        divisi: user.divisi,
        position: user.position,
      },
      date: absenTime, // Mengisi field date dalam dokumen Absensi dengan waktu saat pencatatan absensi
      type: absensiStatus, // Menambahkan status absensi
      file: uploaded_image.url, // Assuming your schema has a field 'imageUrl'
    });
    // console.log(uploaded_image.url);


    const res = await this.absensiModel.create(data);
    return res;
  }

  async findAbsensiByUserId(id: string, query: Query): Promise<Absensi[]> {

    const resPerPage = 10
    const currentPage = Number(query.page) || 1
    const skip = resPerPage * (currentPage - 1)

    return this.absensiModel.find({ 'user._id': id }).sort({ createdAt: -1 }).skip(skip).limit(resPerPage).exec();
  }

  async updateCheckout(id: string, updateAbsensiDto: UpdateAbsensiDto): Promise<Absensi> {
    const absensi = await this.absensiModel.findById(id);

    if (!absensi) {
      throw new HttpException('Absensi not found', HttpStatus.NOT_FOUND);
    }
    // Pastikan bahwa "checkout" ada dalam data yang dikirim dari frontend
    if (!updateAbsensiDto.checkout) {
      throw new HttpException('Invalid data: "checkout" field is missing', HttpStatus.BAD_REQUEST);
    }

    // Setel properti "checkout" dengan nilai yang baru
    absensi.checkout = new Date(updateAbsensiDto.checkout); // Pastikan konversi ke tipe Date jika perlu

    // Simpan perubahan ke database
    const updatedAbsensi = await absensi.save();

    return updatedAbsensi;
  }

  async uploadSingle(image: BufferedFile) {
    let uploaded_image = await this.minioClientService.upload(image)
    // function buat create ke db
    // url nya itu uploaded_image.url

    // Create a new document and save it to the database
    const newUpload = new this.absensiModel({
      file: uploaded_image.url, // Assuming your schema has a field 'imageUrl'
    });

    await newUpload.save();

    return {
      image_url: uploaded_image.url,
      message: "Successfully uploaded to MinIO S3 and saved to the database"
    }
  }

  /**
   * 1.cari user yang hari ini belum absen / alfa
   * 2.kalau sudah ketemu
   * 3.buat suatu function yang akan membuat absensi alfa
   */





}
