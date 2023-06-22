import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { PostMediaEntity } from './entities/post-media.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostReactionEntity } from './entities/post-reaction.entity';
import { UserRepository } from '../user/repositories/user.repository';
import { PostRepository } from './repositories/post.repository';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: PostRepository,
    @InjectRepository(UserEntity)
    private readonly usersRepository: UserRepository,
    @InjectRepository(PostReactionEntity)
    private readonly postReactionsRepository: Repository<PostReactionEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findPost(page: number, limit: number, userId: number) {
    return this.postsRepository.paginatePostWithUserByUserIds(
      page,
      limit,
      userId ? [userId] : [],
    );
  }

  async findPostOfFollowingAndMy(page: number, limit: number, userId: number) {
    const followingsOfAuthenticatedUser = (
      await this.usersRepository.findUserWithFollowById(userId)
    ).followings;
    const userIds = followingsOfAuthenticatedUser.map((user) => user.id);
    userIds.push(userId);
    return this.postsRepository.paginatePostWithUserByUserIds(
      page,
      limit,
      userIds,
    );
  }

  async findPostById(postId: number) {
    const existedPost =
      await this.postsRepository.findPostWithUserAndCommentUserById(postId);
    if (!existedPost) {
      throw new BadRequestException('Post not found');
    }
    return existedPost;
  }

  findMyPosts(page: number, limit: number, userId: number) {
    return this.postsRepository.paginatePostWithUserByUserIds(page, limit, [
      userId,
    ]);
  }

  async createPost(creatPostDto: CreatePostDto, userId: number) {
    const existedUser = await this.usersRepository.findUserById(userId);
    if (!existedUser) {
      throw new BadRequestException('User not found');
    }
    let post = new PostEntity();
    post.user = existedUser;
    post.caption = creatPostDto.caption;
    if (creatPostDto.postMedias) {
      creatPostDto.postMedias = await Promise.all(
        creatPostDto.postMedias.map((base64Image) => {
          return this.cloudinaryService.upload(base64Image);
        }),
      );
    }
    await this.postsRepository.manager.transaction(async (entityManager) => {
      post = await entityManager.save(post);
      if (creatPostDto.postMedias) {
        const newPostMedias = creatPostDto.postMedias.map((urlString) => {
          const postMedia = entityManager.create(PostMediaEntity, {
            mediaUrl: urlString,
            post: post,
          });
          return entityManager.save(postMedia);
        });
        await Promise.all(newPostMedias);
      }
      return post;
    });
    return post;
  }

  async deletePost(postId: number) {
    const existedPost = await this.postsRepository.findPostWithCommentById(
      postId,
    );
    if (!existedPost) {
      throw new BadRequestException('Post not found');
    }
    await this.cloudinaryService.deleteImageByUrl(
      existedPost.postMedias.map((postMedia) => postMedia.mediaUrl),
    );
    return await this.postsRepository.softRemove(existedPost);
  }

  async updatePostById(
    postId: number,
    userId: number,
    updatePostDto: UpdatePostDto,
  ) {
    const existedPost = await this.postsRepository.findPostWithUserById(postId);
    if (!existedPost) {
      throw new BadRequestException('Post not found');
    }
    if (updatePostDto.caption) {
      existedPost.caption = updatePostDto.caption;
    }
    let postReaction;
    if (updatePostDto.reactionType) {
      const userReact = await this.usersRepository.findUserById(userId);
      if (!userReact) {
        throw new BadRequestException('User not found');
      }
      if (userId !== existedPost.user.id) {
        throw new ForbiddenException('Post created by other user');
      }
      postReaction = await this.postReactionsRepository.create({
        type: updatePostDto.reactionType,
        user: userReact,
        post: existedPost,
      });
      existedPost.postReactions.push(postReaction);
      existedPost.numberOfReactions++;
    }
    return this.postsRepository.manager.transaction(async (entityManager) => {
      await entityManager.save(PostReactionEntity, postReaction);
      return entityManager.save(PostEntity, existedPost);
    });
  }
}
