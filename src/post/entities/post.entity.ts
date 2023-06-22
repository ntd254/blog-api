import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { PostReactionEntity } from './post-reaction.entity';
import { PostMediaEntity } from './post-media.entity';
import { PostCommentEntity } from '../../comment/entities/post-comment.entity';
import { BaseEntity } from '../../common/base/base-entity';

@Entity({ name: 'post' })
export class PostEntity extends BaseEntity {
  @Column()
  caption: string;

  @Column({ default: 0 })
  numberOfReactions: number;

  @Column({ default: 0 })
  numberOfComments: number;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  user: UserEntity;

  @OneToMany(() => PostReactionEntity, (postReaction) => postReaction.post, {
    cascade: ['soft-remove'],
  })
  postReactions: PostReactionEntity[];

  @OneToMany(() => PostMediaEntity, (postMedia) => postMedia.post, {
    cascade: ['soft-remove'],
  })
  postMedias: PostMediaEntity[];

  @OneToMany(() => PostCommentEntity, (postComment) => postComment.post, {
    cascade: ['soft-remove'],
  })
  postComments: PostCommentEntity[];
}
