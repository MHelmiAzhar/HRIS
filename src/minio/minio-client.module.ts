import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';

import { MinioClientService } from './minio-client.service';

import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, // Import ConfigModule
    MinioModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule di dalam MinioModule
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get<string>('MINIO_ENDPOINT'), // Menggunakan ConfigService untuk mendapatkan nilai konfigurasi
        // port: configService.get<number>('MINIO_PORT'),
        useSSL: true,
        accessKey: configService.get<string>('MINIO_ACCESSKEY'),
        secretKey: configService.get<string>('MINIO_SECRETKEY'),
      }),
      inject: [ConfigService], // Menyediakan ConfigService ke useFactory
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
