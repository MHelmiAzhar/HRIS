import { Module } from '@nestjs/common';
import { IzinService } from './izin.service';
import { IzinController } from './izin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { IzinSchema } from 'src/schemas/izin.schema';
import { UserModule } from 'src/user/user.module';
import { MinioClientModule } from 'src/minio/minio-client.module';

@Module({
  imports: [
    MinioClientModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'Izin', schema: IzinSchema }])],
  providers: [IzinService, MinioClientModule],
  controllers: [IzinController,]
})
export class IzinModule { }
