import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FamilyEntity } from './family.entity';

@Entity('people')
export class PersonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  familyId!: string;

  @ManyToOne(() => FamilyEntity)
  @JoinColumn({ name: 'familyId' })
  family!: FamilyEntity;

  @Column()
  firstName!: string;

  @Column({ nullable: true })
  middleName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  nepaliName!: string;

  // simple-enum stores as varchar — works with both SQLite and PostgreSQL
  @Column({ type: 'simple-enum', enum: ['male', 'female', 'other'], default: 'male' })
  gender!: string;

  @Column({ type: 'text', nullable: true })
  birthDate!: string;

  @Column({ type: 'simple-enum', enum: ['exact', 'approximate', 'estimated', 'unknown'], default: 'unknown' })
  birthDateAccuracy!: string;

  @Column({ type: 'text', nullable: true })
  deathDate!: string;

  @Column({ type: 'simple-enum', enum: ['exact', 'approximate', 'estimated', 'unknown'], default: 'unknown' })
  deathDateAccuracy!: string;

  @Column({ default: true })
  isLiving!: boolean;

  @Column({ nullable: true })
  photoUrl!: string;

  @Column({ type: 'text', nullable: true })
  biography!: string;

  @Column({ nullable: true })
  caste!: string;

  @Column({ nullable: true })
  subCaste!: string;

  @Column({ nullable: true })
  gotra!: string;

  @Column({ nullable: true })
  ancestralVillage!: string;

  @Column({ nullable: true })
  ancestralDistrict!: string;

  @Column({ nullable: true })
  ancestralProvince!: string;

  @Column({ default: 'Nepal' })
  ancestralCountry!: string;

  // Relationship links (stored as UUIDs)
  @Column({ nullable: true })
  fatherId!: string;

  @Column({ nullable: true })
  motherId!: string;

  @Column({ type: 'simple-enum', enum: ['private', 'family', 'invited', 'public'], default: 'family' })
  privacyLevel!: string;

  @Column({ default: false })
  memorialEnabled!: boolean;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ nullable: true })
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
