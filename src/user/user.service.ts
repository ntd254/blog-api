import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from './entities/role.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: UserRepository,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(username: string, email: string, page: number, limit: number) {
    return this.usersRepository.paginateUserByEmailAndUsername(
      username,
      email,
      page,
      limit,
    );
  }

  async findUserById(id: number) {
    const existedUser = await this.usersRepository.findUserWithFollowById(id);
    if (!existedUser) {
      throw new BadRequestException('User not found');
    }
    return existedUser;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { roles = ['USER'] } = createUserDto;
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const matchRoles = await this.rolesRepository.findBy({ code: In(roles) });
    if (matchRoles.length === 0) {
      throw new BadRequestException('Roles not found');
    }
    const newUser = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      password: createUserDto.password,
      roles: matchRoles,
    });
    return this.usersRepository.save(newUser);
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    let existedUser = await this.usersRepository.findUserWithFollowById(userId);
    if (!existedUser) {
      throw new BadRequestException('User not found');
    }
    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value) {
        existedUser[key] = value;
      }
    });
    if (updateUserDto.avatar) {
      existedUser.avatar = await this.cloudinaryService.upload(
        updateUserDto.avatar,
      );
    }
    if (updateUserDto.coverPicture) {
      existedUser.coverPicture = await this.cloudinaryService.upload(
        updateUserDto.coverPicture,
      );
    }
    let followings: UserEntity[];
    if (updateUserDto.following) {
      followings = await this.usersRepository.find({
        where: updateUserDto.following.map((id) => ({ id })),
      });
      if (followings.length === 0) {
        throw new BadRequestException('Following id not found');
      }
      existedUser.followings.push(...followings);
      existedUser.numberOfFollowing += followings.length;
      existedUser = await this.usersRepository.manager.transaction(
        async (entityManager) => {
          await Promise.all(
            followings.map((user) => {
              user.numberOfFollowers++;
              return entityManager.save(user);
            }),
          );
          return entityManager.save(existedUser);
        },
      );
    }
    existedUser = await this.usersRepository.save(existedUser);
    return existedUser;
  }

  async deleteUser(userId: number) {
    const existedUser = await this.usersRepository.findUserWithPostById(userId);
    if (!existedUser) {
      throw new BadRequestException('User not found');
    }
    const allMediaUrlUserPost = existedUser.posts
      .flatMap((post) => post.postMedias)
      .map((postMedia) => postMedia.mediaUrl);
    await this.cloudinaryService.deleteImageByUrl(allMediaUrlUserPost);
    return await this.usersRepository.deleteUserById(userId);
  }

  async uploadPicture(
    userId: number,
    files: {
      avatar?: Express.Multer.File[];
      coverPicture?: Express.Multer.File[];
    },
  ) {
    const existedUser = await this.usersRepository.findUserById(userId);
    if (!existedUser) {
      throw new BadRequestException('User not found');
    }
    const pictureUrls = await Promise.all(
      Object.entries(files)
        .filter(([field, file]) => file)
        .map(async ([field, file]) => {
          const url = await this.cloudinaryService.uploadStream(file);
          return [field, url];
        }),
    );
    pictureUrls.forEach(([field, url]) => (existedUser[field] = url));
    return this.usersRepository.save(existedUser);
  }
}
