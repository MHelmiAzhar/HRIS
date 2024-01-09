import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DokumenService } from './dokumen.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BufferedFile } from 'src/minio/file.model';
import { AuthGuard } from '@nestjs/passport';
import { CreateDokumenDto } from './dto/create-dokumen.dto';
import { Dokumen } from 'src/schemas/dokumen.schema';

@Controller('dokumen')
export class DokumenController {
  constructor(private dokumenService: DokumenService,) { }

  @Get('all')
  async getAllDokumen() {
    return await this.dokumenService.getAllDokumen();
  }

  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard())
  createFormRepair(@UploadedFile() image: BufferedFile, @Body() createDokumenDto: CreateDokumenDto, @Req() req,): Promise<Dokumen> {
    return this.dokumenService.createDokumen(createDokumenDto, req.user, image);
  }

  // @Post('file')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadSingle(
  //   @UploadedFile() image: BufferedFile
  // ) {
  //   return await this.dokumenService.uploadSingle(image)
  // }
}
