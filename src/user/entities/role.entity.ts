import { BaseEntity } from '../../common/base/base-entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'role' })
export class RoleEntity extends BaseEntity {
  @Column({ default: 'USER' })
  code: string;

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[];
}
