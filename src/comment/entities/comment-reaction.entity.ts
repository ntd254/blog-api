import { BaseEntity } from '../../common/base/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PostCommentEntity } from './post-comment.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ReactionTypesConstant } from '../../common/constants/reaction-types.constant';

@Entity({ name: 'comment_reaction' })
export class CommentReactionEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ReactionTypesConstant,
  })
  type: ReactionTypesConstant;

  @ManyToOne(() => PostCommentEntity, (comment) => comment.commentReactions)
  comment: PostCommentEntity;

  @ManyToOne(() => UserEntity)
  user: UserEntity;
}
