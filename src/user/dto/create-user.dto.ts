import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { EmailNotExisted } from '../../common/validators/email-not-existed.validator';
import { UsernameNotExisted } from '../../common/validators/username-not-existed.validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @UsernameNotExisted()
  username: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsEmail()
  @EmailNotExisted()
  email: string;

  @ApiProperty({ required: false, example: '["ADMIN", "USER"]' })
  @IsString({ each: true })
  @IsOptional()
  roles: string[];
}
