import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { DataSource } from 'typeorm';
import { customUserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
    CloudinaryModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: getRepositoryToken(UserEntity),
      inject: [getDataSourceToken()],
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(UserEntity).extend(customUserRepository),
    },
  ],
  exports: [UserService, getRepositoryToken(UserEntity)],
})
export class UserModule {}
