import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('approval_requests')
export class ApprovalRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  familyId!: string;

  @Column()
  personId!: string;

  @Column()
  requestedBy!: string;

  @Column('text')
  requestedChanges!: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ nullable: true })
  rejectionReason!: string;

  @Column({ nullable: true })
  approvedAt!: Date;

  @Column({ nullable: true })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
