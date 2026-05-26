import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('families')
export class FamilyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  founderId!: string;

  @Column({ nullable: true })
  profileImageUrl!: string;

  @Column({ nullable: true })
  ancestralVillage!: string;

  @Column({ nullable: true })
  ancestralDistrict!: string;

  @Column({ nullable: true })
  ancestralProvince!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
