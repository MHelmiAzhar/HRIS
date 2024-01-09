import { Module } from '@nestjs/common';
import { CutiController } from './cuti.controller';
import { CutiService } from './cuti.service';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CutiSchema } from 'src/schemas/cuti.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MinioClientModule } from 'src/minio/minio-client.module';

@Module({
  imports: [
    MinioClientModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'Cuti', schema: CutiSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),],
  providers: [CutiService, MinioClientModule],
  controllers: [CutiController,]
})
export class CutiModule { }
