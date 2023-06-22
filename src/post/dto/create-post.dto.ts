import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @IsString()
  @ApiProperty()
  caption: string;

  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    example: '["data:image/jpeg;base64..."]',
    type: [String],
    required: false,
  })
  postMedias: string[];
}
