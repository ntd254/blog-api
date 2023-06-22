import { Module } from '@nestjs/common';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { PostCommentEntity } from './entities/post-comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { DataSource } from 'typeorm';
import { customCommentRepository } from './repositories/comment.repository';
import { CommentReactionEntity } from './entities/comment-reaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostCommentEntity, CommentReactionEntity]),
    UserModule,
    PostModule,
  ],
  controllers: [CommentController],
  providers: [
    CommentService,
    {
      provide: getRepositoryToken(PostCommentEntity),
      inject: [getDataSourceToken()],
      useFactory: (dataSource: DataSource) =>
        dataSource
          .getRepository(PostCommentEntity)
          .extend(customCommentRepository),
    },
  ],
  exports: [getRepositoryToken(PostCommentEntity)],
})
export class CommentModule {}
