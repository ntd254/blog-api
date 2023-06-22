import { Repository } from 'typeorm';
import { PostCommentEntity } from '../entities/post-comment.entity';

export interface CommentRepository extends Repository<PostCommentEntity> {
  findCommentById(id: number): Promise<PostCommentEntity>;

  findCommentWithUserById(id: number): Promise<PostCommentEntity>;

  findCommentWithChildAndReactionById(id: number): Promise<PostCommentEntity>;
}

export const customCommentRepository: Partial<CommentRepository> = {
  findCommentWithChildAndReactionById(
    this: CommentRepository,
    id: number,
  ): Promise<PostCommentEntity> {
    return this.findOne({
      where: { id },
      relations: { childComments: true, commentReactions: true },
    });
  },

  findCommentById(
    this: CommentRepository,
    id: number,
  ): Promise<PostCommentEntity> {
    return this.findOneBy({ id });
  },

  findCommentWithUserById(
    this: CommentRepository,
    id: number,
  ): Promise<PostCommentEntity> {
    return this.findOne({
      where: { id },
      relations: { user: true, commentReactions: true },
    });
  },
};
