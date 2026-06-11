import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('cross_family_links')
export class CrossFamilyLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // The child person (lives in their own family)
  @Column()
  personId!: string;

  // The parent person (lives in a different family)
  @Column()
  linkedParentId!: string;

  // The family the linked parent belongs to
  @Column()
  linkedFamilyId!: string;

  // Whether the linked person is father or mother
  @Column({ type: 'simple-enum', enum: ['father', 'mother'] })
  linkType!: string;

  @Column({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
