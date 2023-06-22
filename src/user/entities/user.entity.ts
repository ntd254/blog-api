import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base-entity';
import { RoleEntity } from './role.entity';
import { PostEntity } from '../../post/entities/post.entity';
import { PostReactionEntity } from '../../post/entities/post-reaction.entity';
import { PostCommentEntity } from '../../comment/entities/post-comment.entity';
import { Exclude, Expose } from 'class-transformer';
import { CommentReactionEntity } from '../../comment/entities/comment-reaction.entity';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  @ApiProperty()
  username: string;

  @Column({ nullable: true })
  @Exclude()
  @ApiProperty()
  password: string;

  @Column({ nullable: true })
  @ApiProperty()
  fullName: string;

  @Column()
  // @Expose({ groups: ['user'] })
  @ApiProperty()
  email: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  @ApiProperty()
  dob: Date;

  @Column({
    nullable: true,
  })
  @ApiProperty()
  phone: string;

  @Column({
    nullable: true,
  })
  @ApiProperty()
  address: string;

  @Column({
    nullable: true,
  })
  @ApiProperty()
  avatar: string;

  @Column({
    nullable: true,
  })
  @ApiProperty()
  coverPicture: string;

  @Column({
    default: 0,
  })
  @ApiProperty()
  numberOfPosts: number;

  @Column({ default: 0 })
  @ApiProperty()
  numberOfFollowers: number;

  @Column({ default: 0 })
  @ApiProperty()
  numberOfFollowing: number;

  @JoinTable({
    name: 'follow',
    joinColumn: {
      name: 'userId',
    },
    inverseJoinColumn: {
      name: 'following',
    },
  })
  @ManyToMany(() => UserEntity, (user) => user.followers)
  followings: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.followings)
  followers: UserEntity[];

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable()
  roles: RoleEntity[];

  @OneToMany(() => PostEntity, (post) => post.user, {
    cascade: ['soft-remove'],
  })
  posts: PostEntity[];

  @OneToMany(() => PostReactionEntity, (postReaction) => postReaction.user, {
    cascade: ['soft-remove'],
  })
  postReactions: PostReactionEntity[];

  @OneToMany(() => PostCommentEntity, (postComment) => postComment.user, {
    cascade: ['soft-remove'],
  })
  postComments: PostCommentEntity[];

  @OneToMany(
    () => CommentReactionEntity,
    (commentReaction) => commentReaction.user,
    { cascade: ['soft-remove'] },
  )
  commentReactions: CommentReactionEntity[];
}
