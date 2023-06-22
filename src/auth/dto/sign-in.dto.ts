import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @IsString()
  @ApiProperty({ example: 'dat123' })
  username: string;

  @IsString()
  @ApiProperty({ example: '1234' })
  password: string;
}
