import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostReactionEntity } from './entities/post-reaction.entity';
import { PostMediaEntity } from './entities/post-media.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UserModule } from '../user/user.module';
import { DataSource } from 'typeorm';
import { customPostRepository } from './repositories/post.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, PostReactionEntity, PostMediaEntity]),
    CloudinaryModule,
    UserModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    {
      provide: getRepositoryToken(PostEntity),
      inject: [getDataSourceToken()],
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(PostEntity).extend(customPostRepository),
    },
  ],
  exports: [getRepositoryToken(PostEntity)],
})
export class PostModule {}
