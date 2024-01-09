import { Body, Controller, Post, Get, Req, UseGuards, Query, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FormService } from './form.service';
import { AuthGuard } from '@nestjs/passport';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Form } from 'src/schemas/form.schema';
import { CreateFormRepairDto } from './dto/create-form-perbaikan.dto';
import { CreateFormPurchaseDto } from './dto/create-form-pembelian.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BufferedFile } from 'src/minio/file.model';

@Controller('form')
export class FormController {

    constructor(private formService: FormService) { }

    @Get('/all')
    // @UseGuards(AuthGuard())
    async getAllForm(@Query() query: ExpressQuery): Promise<Form[]> {
        return this.formService.findAll(query)
    }

    @Post('/create/repair')
    @UseInterceptors(FileInterceptor('image'))
    @UseGuards(AuthGuard())
    createFormRepair(@UploadedFile() image: BufferedFile, @Body() createFormRepairDto: CreateFormRepairDto, @Req() req,): Promise<Form> {
        return this.formService.createForm(createFormRepairDto, req.user, image);
    }

    @Post('/create/purchase')
    @UseInterceptors(FileInterceptor('image'))
    @UseGuards(AuthGuard())
    createFormPurchase(@UploadedFile() image: BufferedFile, @Body() createFormPurchaseDto: CreateFormPurchaseDto, @Req() req,): Promise<Form> {
        return this.formService.createForm(createFormPurchaseDto, req.user, image);
    }

    @Patch('update/:id')
    @UseGuards(AuthGuard())
    async updateForm(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto, @Req() req,): Promise<Form> {
        if (req.user.role === "Admin") {
            return this.formService.updateForm(id, updateFormDto);
        } else {
            throw new HttpException('Unathorized', HttpStatus.UNAUTHORIZED);
        }
    }

    @Get('by/:id')
    async getFormByUserId(@Param('id') id: string, @Query() query: ExpressQuery) {
        const Form = await this.formService.findFormByUserId(id, query);
        return Form;
    }

    // @Post('file')
    // @UseInterceptors(FileInterceptor('image'))
    // async uploadSingle(
    //   @UploadedFile() image: BufferedFile
    // ) {
    //   return await this.formService.uploadSingle(image)
    // }

    @Delete('/delete/:id')
    deleteForm(
        @Param('id')
        id: string
    ): Promise<Form> {
        return this.formService.deleteById(id);
    }


}
