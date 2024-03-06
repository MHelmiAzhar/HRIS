import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AbsensiModule } from './absensi/absensi.module';
import { IzinModule } from './izin/izin.module';
import { CutiModule } from './cuti/cuti.module';
import { MinioClientModule } from './minio/minio-client.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DokumenModule } from './dokumen/dokumen.module';
import { FormModule } from './form/form.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_URI),
    MulterModule.register({
      dest: './uploads',
    }),
    UserModule,
    AbsensiModule,
    IzinModule,
    CutiModule,
    MinioClientModule,
    DokumenModule,
    FormModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
