import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DokumenService } from './dokumen.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BufferedFile } from 'src/minio/file.model';
import { AuthGuard } from '@nestjs/passport';
import { CreateDokumenDto } from './dto/create-dokumen.dto';
import { Dokumen } from 'src/schemas/dokumen.schema';
import { UpdateDokumenDto } from './dto/update-dokumen.dto';

@Controller('dokumen')
export class DokumenController {
  constructor(private dokumenService: DokumenService) {}

  @Get('all')
  async getAllDokumen() {
    return await this.dokumenService.getAllDokumen();
  }

  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard())
  createFormRepair(
    @UploadedFile() image: BufferedFile,
    @Body() createDokumenDto: CreateDokumenDto,
    @Req() req,
  ): Promise<Dokumen> {
    return this.dokumenService.createDokumen(createDokumenDto, req.user, image);
  }

  @Patch('/edit/:id')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard())
  async editDokumen(
    @UploadedFile() image: BufferedFile,
    @Body() updateDokumenDto: UpdateDokumenDto,
    @Req() req,
    @Param('id') id: string,
  ) {
    if (req.user.role === 'Admin') {
      const userId = req.user._id;
      const payload = { ...updateDokumenDto, image, userId, id };
      await this.dokumenService.updateDokumen(payload);
      return { message: 'Document updated successfully' };
    } else {
      throw new HttpException('Unathorized', HttpStatus.UNAUTHORIZED);
    }
  }
  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteDokumen(@Param('id') id: string, @Req() req) {
    if (req.user.role === 'Admin') {
      await this.dokumenService.deleteDokumen(id);
      return { message: 'Document deleted successfully' };
    } else {
      throw new HttpException('Unathorized', HttpStatus.UNAUTHORIZED);
    }
  }

  // @Post('file')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadSingle(
  //   @UploadedFile() image: BufferedFile
  // ) {
  //   return await this.dokumenService.uploadSingle(image)
  // }
}
