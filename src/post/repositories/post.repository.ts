import { IsNull, Repository } from 'typeorm';
import { PostEntity } from '../entities/post.entity';

export interface PostRepository extends Repository<PostEntity> {
  paginatePostWithUserByUserIds(
    page: number,
    limit: number,
    ids: number[],
  ): Promise<PostEntity[]>;

  findPostById(id): Promise<PostEntity>;

  findPostWithUserAndCommentUserById(id: number): Promise<PostEntity>;

  findPostWithCommentById(id: number): Promise<PostEntity>;

  findPostWithUserById(id: number): Promise<PostEntity>;
}

export const customPostRepository: Partial<PostRepository> = {
  findPostById(this: PostRepository, id): Promise<PostEntity> {
    return this.findOneBy({ id });
  },

  findPostWithUserById(this: PostRepository, id: number): Promise<PostEntity> {
    return this.findOne({
      where: { id },
      relations: { user: true, postReactions: true, postMedias: true },
    });
  },

  findPostWithCommentById(
    this: PostRepository,
    id: number,
  ): Promise<PostEntity> {
    return this.findOne({
      where: { id },
      relations: { postMedias: true, postComments: true, postReactions: true },
    });
  },

  paginatePostWithUserByUserIds(
    this: PostRepository,
    page: number,
    limit: number,
    ids: number[],
  ): Promise<PostEntity[]> {
    const getPostsQuery = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.postMedias', 'media')
      .leftJoinAndSelect('post.postReactions', 'reaction')
      .leftJoinAndSelect('post.user', 'user')
      .where('user.id IN (:...ids)', { ids });
    if (page && limit) {
      return getPostsQuery
        .take(limit)
        .skip(page === 0 ? 0 : (page - 1) * limit)
        .getMany();
    }
    return getPostsQuery.getMany();
  },

  findPostWithUserAndCommentUserById(
    this: PostRepository,
    id: number,
  ): Promise<PostEntity> {
    return this.findOne({
      where: { id, postComments: { parentComment: IsNull() } },
      relations: {
        postMedias: true,
        postReactions: true,
        user: true,
        postComments: {
          user: true,
          childComments: { user: true },
          parentComment: true,
        },
      },
      order: { postComments: { numberOfReactions: 'DESC' } },
    });
  },
};
