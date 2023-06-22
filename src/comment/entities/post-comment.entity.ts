import { BaseEntity } from '../../common/base/base-entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { PostEntity } from '../../post/entities/post.entity';
import { CommentReactionEntity } from './comment-reaction.entity';

@Entity({ name: 'post_comment' })
export class PostCommentEntity extends BaseEntity {
  @Column()
  content: string;

  @Column({ default: 0 })
  numberOfReactions: number;

  @ManyToOne(
    () => PostCommentEntity,
    (postComment) => postComment.childComments,
  )
  parentComment: PostCommentEntity;

  @OneToMany(
    () => PostCommentEntity,
    (postComment) => postComment.parentComment,
    { cascade: ['soft-remove'] },
  )
  childComments: PostCommentEntity[];

  @OneToMany(
    () => CommentReactionEntity,
    (commentReaction) => commentReaction.comment,
    { cascade: ['soft-remove'] },
  )
  commentReactions: CommentReactionEntity[];

  @ManyToOne(() => PostEntity)
  post: PostEntity;

  @ManyToOne(() => UserEntity)
  user: UserEntity;
}
