import {
  Body,
  Controller,
  Patch,
  Post,
  Get,
  Query,
  Param,
  Delete,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { User } from 'src/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { JWTAuthGuard } from './jwt-auth.guard';
import { request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('USER')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  // @Roles('Public') // Anda perlu membuat decorator ini
  // @UseGuards(RolesGuard) // Gunakan guard yang Anda buat
  createUser(@Body() createUserDto: CreateUserDto): Promise<{ token: string }> {
    return this.userService.createUser(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return this.userService.login(loginDto);
  }

  @Patch('/update/:id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Get('/all')
  async getAllUsers(@Query() query: ExpressQuery): Promise<User[]> {
    return this.userService.findAll(query);
  }

  @Get('by/:id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Delete('/delete/:id')
  deleteUser(
    @Param('id')
    id: string,
  ): Promise<User> {
    return this.userService.deleteById(id);
  }

  @UseGuards(JWTAuthGuard)
  @Get('/user-info')
  getUserInfo(@Request() req) {
    return {
      user_info: req?.user,
    };
  }

  @Post('add-annual-leave')
  async addAnnualLeaveToAllUsers(): Promise<string> {
    try {
      await this.userService.addAnnualLeaveToAllUsers();
      return 'Success: Annual leave added to all users';
    } catch (error) {
      console.error('Error adding annual leave to all users:', error);
      throw error;
    }
  }
}
