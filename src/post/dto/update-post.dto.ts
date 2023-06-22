import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionTypesConstant } from '../../common/constants/reaction-types.constant';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  caption: string;

  @IsOptional()
  @IsEnum(ReactionTypesConstant)
  @ApiProperty({ required: false, enum: ReactionTypesConstant })
  reactionType: ReactionTypesConstant;
}
