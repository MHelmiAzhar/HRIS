import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { config } from './config';
import { BufferedFile } from './file.model';
import * as crypto from 'crypto';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket = config.MINIO_BUCKET;

  public get client() {
    return this.minio.client;
  }

  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioStorageService');
  }

  public async upload(file: BufferedFile, user: string) {
    const baseBucket: string = this.baseBucket;
    if (
      !(
        file.mimetype.includes('jpeg') ||
        file.mimetype.includes('png') ||
        file.mimetype.includes('pdf')
      )
    ) {
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }
    let currentTime = Date.now().toString();
    let filename = `${user}-${currentTime}-${file.originalname}`;
    // let ext = file.originalname.substring(
    //   file.originalname.lastIndexOf('.'),
    //   file.originalname.length,
    // );

    // let filename = ext;

    const fileName = filename;
    const fileBuffer = file.buffer;
    this.client.putObject(
      baseBucket,
      fileName,
      fileBuffer,
      function (err, res) {
        if (err)
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
      },
    );

    return {
      url: `https://${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${filename}`,
    };
  }

  async delete(objetName: string, baseBucket: string = this.baseBucket) {
    this.client.getObject(baseBucket, objetName, function (err, res) {
      if (err)
        throw new HttpException(
          'Oops Something wrong happend',
          HttpStatus.BAD_REQUEST,
        );
    });
  }
}
