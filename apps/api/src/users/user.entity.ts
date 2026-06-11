import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ default: 'member' })
  role!: string; // admin | elder | contributor | member | viewer

  @Column({ default: 'active' })
  status!: string; // active | suspended | pending

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ nullable: true, select: false })
  passwordHash?: string;

  @Column({ nullable: true, select: false })
  passwordSalt?: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'simple-json', nullable: true })
  preferences?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
