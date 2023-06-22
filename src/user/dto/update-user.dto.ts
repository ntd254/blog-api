import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsMobilePhone,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ required: false, example: '04/25/2001' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dob: Date;

  @ApiProperty({ required: false })
  @IsMobilePhone('vi-VN')
  @IsOptional()
  phone: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  coverPicture: string;

  @ApiProperty({ required: false, example: '[1, 2, 3]' })
  @IsOptional()
  @IsNumber(undefined, { each: true })
  following: number[];
}
