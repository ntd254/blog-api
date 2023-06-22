import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn({
    type: 'datetime',
  })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
  })
  @ApiProperty()
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'datetime',
  })
  @Exclude()
  @ApiProperty()
  deletedAt: Date;
}
