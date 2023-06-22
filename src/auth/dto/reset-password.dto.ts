import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  newPassword: string;

  @IsNumber()
  @ApiProperty()
  userId: number;

  @IsString()
  @ApiProperty()
  token: string;
}
