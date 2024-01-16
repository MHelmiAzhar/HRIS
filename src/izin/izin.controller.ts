import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  UseGuards,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateIzinDto } from './dto/create-izin';
import { Izin } from 'src/schemas/izin.schema';
import { IzinService } from './izin.service';
import { AuthGuard } from '@nestjs/passport';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateIzinDto } from './dto/update-izin.dto';
import { BufferedFile } from 'src/minio/file.model';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('izin')
export class IzinController {
  constructor(private izinService: IzinService) {}

  @Get('/all')
  @UseGuards(AuthGuard())
  async getAllIzin(@Query() query: ExpressQuery): Promise<Izin[]> {
    return this.izinService.findAll(query);
  }

  @Post('/create')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  createIzin(
    @UploadedFile() image: BufferedFile,
    @Body() createIzinDto: CreateIzinDto,
    @Req() req,
  ): Promise<Izin> {
    return this.izinService.createIzin(createIzinDto, req.user, image);
  }

  @Get('by/:id')
  async getIzinByUserId(@Param('id') id: string, @Query() query: ExpressQuery) {
    const izin = await this.izinService.findIzinByUserId(id, query);
    return izin;
  }

  @Patch('approved/:id')
  @UseGuards(AuthGuard())
  async updateApproved(
    @Param('id') id: string,
    @Body() updateIzinDto: UpdateIzinDto,
    @Req() req,
  ): Promise<Izin> {
    if (req.user.role === 'Admin') {
      const updatedIzin = await this.izinService.updateApproved(
        id,
        updateIzinDto,
      );
      return updatedIzin;
    } else {
      throw new HttpException('Unathorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
