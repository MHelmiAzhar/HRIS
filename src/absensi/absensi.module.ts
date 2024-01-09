import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbsensiService } from './absensi.service';
import { AbsensiController } from './absensi.controller';
import { AbsensiSchema } from 'src/schemas/absensi.schema';
import { UserModule } from 'src/user/user.module';
import { MinioClientModule } from 'src/minio/minio-client.module';
import { IzinModule } from 'src/izin/izin.module';
import { CutiModule } from 'src/cuti/cuti.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Izin, IzinSchema } from 'src/schemas/izin.schema';
import { Cuti, CutiSchema } from 'src/schemas/cuti.schema';

@Module({
    imports: [
        MinioClientModule,
        UserModule,
        IzinModule,
        CutiModule,
        MongooseModule.forFeature([{ name: 'Absensi', schema: AbsensiSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Izin.name, schema: IzinSchema }]),
        MongooseModule.forFeature([{ name: Cuti.name, schema: CutiSchema }]),
    ],

    providers: [AbsensiService, MinioClientModule],
    controllers: [AbsensiController],
})
export class AbsensiModule { }
