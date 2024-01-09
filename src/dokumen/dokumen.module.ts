import { Module } from '@nestjs/common';
import { DokumenController } from './dokumen.controller';
import { DokumenService } from './dokumen.service';
import { MinioClientModule } from 'src/minio/minio-client.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { DokumenSchema } from 'src/schemas/dokumen.schema';

@Module({
  imports: [
    MinioClientModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'Dokumen', schema: DokumenSchema }]),],
  controllers: [DokumenController],
  providers: [DokumenService, MinioClientModule]
})
export class DokumenModule { }
