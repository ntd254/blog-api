import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

export interface UserRepository extends Repository<UserEntity> {
  findUserById(id: number): Promise<UserEntity>;

  findUserWithRoleById(id: number): Promise<UserEntity>;

  findUserWithFollowById(id: number): Promise<UserEntity>;

  deleteUserById(id: number): Promise<UserEntity>;

  findUserWithPostById(id: number): Promise<UserEntity>;

  findUserWithRoleByEmail(email: string): Promise<UserEntity>;

  findUserWithRoleByUsername(username: string): Promise<UserEntity>;

  findUserByEmail(email: string): Promise<UserEntity>;

  paginateUserByEmailAndUsername(
    username: string,
    email: string,
    page: number,
    limit: number,
  ): Promise<UserEntity[]>;
}

export const customUserRepository: Partial<UserRepository> = {
  paginateUserByEmailAndUsername(
    username: string,
    email: string,
    page: number,
    limit: number,
  ) {
    const query = this.createQueryBuilder('user');
    username &&
      query.where('LOWER (user.username) LIKE :username', {
        username: `%${username.toLowerCase()}%`,
      });
    email &&
      query.andWhere('LOWER (user.email) LIKE :email', {
        email: `%${email.toLowerCase()}%`,
      });
    limit && query.take(limit);
    page && query.skip(page === 0 ? 0 : (page - 1) * limit);
    return query.getMany();
  },

  findUserByEmail(this: UserRepository, email: string): Promise<UserEntity> {
    return this.findOne({ where: { email } });
  },

  findUserWithRoleById(this: UserRepository, id: number): Promise<UserEntity> {
    return this.findOne({ where: { id }, relations: { roles: true } });
  },

  findUserWithRoleByEmail(
    this: UserRepository,
    email: string,
  ): Promise<UserEntity> {
    return this.findOne({ where: { email }, relations: { roles: true } });
  },

  findUserWithRoleByUsername(
    this: UserRepository,
    username: string,
  ): Promise<UserEntity> {
    return this.findOne({
      where: { username },
      relations: { roles: true },
    });
  },

  findUserWithPostById(this: UserRepository, id: number): Promise<UserEntity> {
    return this.findOne({
      where: { id },
      relations: { posts: { postMedias: true } },
    });
  },

  findUserById(this: UserRepository, id: number): Promise<UserEntity> {
    return this.findOneByOrFail({ id });
  },

  findUserWithFollowById(
    this: UserRepository,
    id: number,
  ): Promise<UserEntity> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.followings', 'following')
      .leftJoinAndSelect('user.followers', 'follower')
      .where('user.id = :id', { id })
      .getOne();
  },

  async deleteUserById(this: UserRepository, id: number): Promise<UserEntity> {
    const existedUser = await this.findOne({
      where: { id },
      relations: {
        posts: { postMedias: true },
        postComments: true,
        postReactions: true,
        commentReactions: true,
        followings: true,
        followers: true,
      },
    });
    return this.manager.transaction(async (entityManager) => {
      const userRepository = entityManager.withRepository(this);
      await Promise.all(
        existedUser.followings.map((following) => {
          following.numberOfFollowers--;
          return userRepository.save(following);
        }),
      );
      await Promise.all(
        existedUser.followers.map((follower) => {
          follower.numberOfFollowing--;
          return userRepository.save(follower);
        }),
      );
      return userRepository.softRemove(existedUser);
    });
  },
};
