import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentService } from './comment.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../common/decorators/user.decorator';

@Controller('comments')
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('comments')
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentsService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create comment of authenticated user' })
  @ApiCreatedResponse({
    description: 'Return created comment',
  })
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @User('id') userId: number,
  ) {
    return this.commentsService.createComment(createCommentDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update comment content' })
  @ApiOkResponse({ description: 'Return updated comment' })
  updateComment(
    @Param('id') commentId: number,
    @User('id') userId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(
      commentId,
      userId,
      updateCommentDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment' })
  @ApiOkResponse({ description: 'Return deleted comment' })
  deleteComment(@Param('id') commentId: number) {
    return this.commentsService.deleteComment(commentId);
  }
}
