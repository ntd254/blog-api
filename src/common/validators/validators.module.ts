import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { EmailNotExistedValidator } from './email-not-existed.validator';
import { UsernameNotExistedValidator } from './username-not-existed.validator';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [EmailNotExistedValidator, UsernameNotExistedValidator],
  exports: [EmailNotExistedValidator, UsernameNotExistedValidator],
})
export class ValidatorsModule {}
