import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostCommentEntity } from './entities/post-comment.entity';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserRepository } from '../user/repositories/user.repository';
import { PostRepository } from '../post/repositories/post.repository';
import { CommentRepository } from './repositories/comment.repository';
import { Repository } from 'typeorm';
import { CommentReactionEntity } from './entities/comment-reaction.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(PostCommentEntity)
    private readonly postCommentRepository: CommentRepository,
    @InjectRepository(CommentReactionEntity)
    private readonly commentReactionRepository: Repository<CommentReactionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: UserRepository,
    @InjectRepository(PostEntity)
    private readonly postRepository: PostRepository,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, userId: number) {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new BadRequestException('User not found');
    }
    const existedPost = await this.postRepository.findPostById(
      createCommentDto.postId,
    );
    if (!existedPost) {
      throw new BadRequestException('Post not found');
    }
    existedPost.numberOfComments++;
    let parentComment: PostCommentEntity;
    if (createCommentDto.replyCommentId) {
      parentComment = await this.postCommentRepository.findCommentById(
        createCommentDto.replyCommentId,
      );
      if (!parentComment) {
        throw new BadRequestException('Reply comment not found');
      }
    }
    const newComment = this.postCommentRepository.create({
      user: existedUser,
      post: existedPost,
      parentComment: parentComment,
      content: createCommentDto.content,
    });
    return this.postCommentRepository.manager.transaction(
      async (entityManager) => {
        await entityManager.save(PostEntity, existedPost);
        return entityManager.save(PostCommentEntity, newComment);
      },
    );
  }

  async updateComment(
    commentId: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const existedComment =
      await this.postCommentRepository.findCommentWithUserById(commentId);
    if (!existedComment) {
      throw new BadRequestException('Comment not found');
    }
    let commentReaction;
    if (updateCommentDto.reactionType) {
      const userReact = await this.userRepository.findUserById(userId);
      if (!userReact) {
        throw new BadRequestException('User not found');
      }
      if (existedComment.user.id !== userId) {
        throw new ForbiddenException('Comment created by other user');
      }
      commentReaction = await this.commentReactionRepository.create({
        type: updateCommentDto.reactionType,
        user: userReact,
        comment: existedComment,
      });
      existedComment.commentReactions.push(commentReaction);
      existedComment.numberOfReactions++;
    }
    if (updateCommentDto.content) {
      existedComment.content = updateCommentDto.content;
    }
    return this.postCommentRepository.manager.transaction(
      async (entityManager) => {
        await entityManager.save(CommentReactionEntity, commentReaction);
        return entityManager.save(PostCommentEntity, existedComment);
      },
    );
  }

  async deleteComment(commentId: number) {
    const existedComment =
      await this.postCommentRepository.findCommentWithChildAndReactionById(
        commentId,
      );
    if (!existedComment) {
      throw new BadRequestException('Comment not found');
    }
    return this.postCommentRepository.softRemove(existedComment);
  }
}
