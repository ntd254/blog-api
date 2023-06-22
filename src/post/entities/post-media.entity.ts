import { BaseEntity } from '../../common/base/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity({ name: 'post_media' })
export class PostMediaEntity extends BaseEntity {
  @Column()
  mediaUrl: string;

  @ManyToOne(() => PostEntity)
  post: PostEntity;
}
