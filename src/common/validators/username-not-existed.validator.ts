import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
@ValidatorConstraint({ async: true })
export class UsernameNotExistedValidator
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Username ${validationArguments.value} is existed`;
  }

  async validate(username: any, validationArguments?: ValidationArguments) {
    const existedUsername = await this.usersRepository.findOneBy({
      username: username,
    });
    return !existedUsername;
  }
}

export function UsernameNotExisted(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Username must not existed',
      target: object.constructor,
      propertyName: propertyName,
      validator: UsernameNotExistedValidator,
      async: true,
      options: validationOptions,
    });
  };
}
