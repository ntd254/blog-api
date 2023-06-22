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
export class EmailNotExistedValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Email ${validationArguments.value} is existed`;
  }

  async validate(email: any, validationArguments?: ValidationArguments) {
    const existedUser = await this.usersRepository.findOneBy({ email: email });
    return !existedUser;
  }
}

export function EmailNotExisted(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Email must not existed',
      target: object.constructor,
      propertyName: propertyName,
      validator: EmailNotExistedValidator,
      async: true,
      options: validationOptions,
    });
  };
}
