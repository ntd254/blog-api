import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @IsString()
  @ApiProperty()
  currentPassword: string;

  @IsString()
  @ApiProperty()
  newPassword: string;
}
