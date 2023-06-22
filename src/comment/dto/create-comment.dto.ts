import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @IsString()
  @ApiProperty()
  content: string;

  @IsNumber()
  @ApiProperty()
  postId: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  replyCommentId: number;
}
