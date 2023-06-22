import { BaseEntity } from '../../common/base/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ReactionTypesConstant } from '../../common/constants/reaction-types.constant';

@Entity({ name: 'post_reaction' })
export class PostReactionEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ReactionTypesConstant,
  })
  type: ReactionTypesConstant;

  @ManyToOne(() => PostEntity, (post) => post.postReactions)
  post: PostEntity;

  @ManyToOne(() => UserEntity, (user) => user.postReactions)
  user: UserEntity;
}
