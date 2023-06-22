import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  SerializeOptions,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RolesConstant } from '../common/constants/roles.constant';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UploadPictureDto } from './dto/upload-picture.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesConstant.Admin, RolesConstant.User)
  @ApiOperation({ summary: 'Get users ' })
  @ApiOkResponse({
    description: 'Return array of users',
  })
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAllUsers(
    @Query('username') username: string,
    @Query('email') email: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.usersService.findAll(username, email, page, limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesConstant.Admin, RolesConstant.User)
  // @SerializeOptions({ groups: ['admin'] })
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({
    description: 'Return user',
  })
  getUserById(@Param('id') id: number) {
    return this.usersService.findUserById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse({
    description: 'Return created user',
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesConstant.Admin, RolesConstant.User)
  @ApiOperation({ summary: 'Update authenticated user' })
  @ApiOkResponse({
    description: 'Return updated user',
  })
  updateUser(@User('id') userId, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Post('upload-picture')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesConstant.Admin, RolesConstant.User)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'coverPicture', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Update avatar or cover picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadPictureDto })
  @ApiCreatedResponse({
    description: 'Your avatar and background has been updated',
  })
  updatePicture(
    @User('id') userId: number,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      coverPicture?: Express.Multer.File[];
    },
  ) {
    return this.usersService.uploadPicture(userId, files);
  }

  @Delete()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesConstant.Admin, RolesConstant.User)
  @ApiOperation({ summary: 'Delete authenticated user' })
  @ApiOkResponse({
    description: 'Return deleted user',
  })
  deleteUser(@User('id') userId: number) {
    return this.usersService.deleteUser(userId);
  }
}
