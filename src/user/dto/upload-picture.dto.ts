import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UploadPictureDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  avatar: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  coverPicture: any;
}
