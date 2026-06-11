import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';

@Entity('family_members')
@Unique(['familyId', 'userId'])
export class FamilyMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  familyId!: string;

  @Column()
  userId!: string;

  @Column({ type: 'simple-enum', enum: ['admin', 'elder', 'contributor', 'member', 'viewer'], default: 'member' })
  role!: string;

  @Column({ default: true })
  isApproved!: boolean;

  @Column({ nullable: true })
  invitedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
