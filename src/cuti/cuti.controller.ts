import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateCutiDto } from './dto/create-cuti.dto';
import { Cuti } from 'src/schemas/cuti.schema';
import { CutiService } from './cuti.service';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateCutiDto } from './dto/update-cuti.dto';
import { BufferedFile } from 'src/minio/file.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('CUTI')
@Controller('cuti')
export class CutiController {
  constructor(private cutiService: CutiService) {}

  @Get('/all')
  @UseGuards(AuthGuard())
  async getAllCuti(@Query() query: ExpressQuery): Promise<Cuti[]> {
    return this.cutiService.findAll(query);
  }

  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard())
  createCuti(
    @Body() createCutiDto: CreateCutiDto,
    @Req() req,
    @UploadedFile() image?: BufferedFile,
  ): Promise<Cuti> {
    return this.cutiService.createCuti(createCutiDto, req.user, image);
  }

  @Get('by/:id')
  async getCutiByUserId(@Param('id') id: string, @Query() query: ExpressQuery) {
    const cuti = await this.cutiService.findCutiByUserId(id, query);
    return cuti;
  }

  @Patch('approved/:id')
  @UseGuards(AuthGuard())
  async updateApproved(
    @Param('id') id: string,
    @Body() updateCutiDto: UpdateCutiDto,
    @Req() req,
  ): Promise<Cuti> {
    if (req.user.role === 'Admin') {
      const updatedCuti = await this.cutiService.updateApproved(
        id,
        updateCutiDto,
      );
      return updatedCuti;
    } else {
      throw new HttpException('Unathorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
