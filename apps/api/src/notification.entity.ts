import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  senderId!: string;

  @Column()
  title!: string;

  @Column('text')
  message!: string;

  @Column({ default: 'milestone' })
  type!: string;

  @Column({ nullable: true })
  relatedId!: string;

  @Column({ nullable: true })
  relatedType!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ nullable: true })
  readAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
