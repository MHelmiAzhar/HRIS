import { Module } from '@nestjs/common';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { MinioClientModule } from 'src/minio/minio-client.module';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSchema } from 'src/schemas/form.schema';

@Module({
  imports: [
    MinioClientModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'Form', schema: FormSchema }]),],
  controllers: [FormController],
  providers: [FormService, MinioClientModule]
})
export class FormModule { }
