import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateFamilyRequest, Family } from '@vansha/shared-types';
import { FamilyEntity } from '../family.entity';
import { FamilyMemberEntity } from '../family-member.entity';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(FamilyEntity)
    private familyRepository: Repository<FamilyEntity>,
    @InjectRepository(FamilyMemberEntity)
    private memberRepository: Repository<FamilyMemberEntity>,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async createFamily(userId: string, data: CreateFamilyRequest): Promise<Family> {
    const family = this.familyRepository.create({
      name: data.name,
      description: data.description,
      founderId: userId,
      ancestralVillage: data.ancestralVillage,
      ancestralDistrict: data.ancestralDistrict,
      ancestralProvince: data.ancestralProvince,
      isActive: true,
    });

    const saved = await this.familyRepository.save(family);

    // Founder automatically becomes admin member
    const member = this.memberRepository.create({
      familyId: saved.id,
      userId,
      role: 'admin',
      isApproved: true,
    });
    await this.memberRepository.save(member);

    await this.auditService.log({
      actorId: userId,
      action: 'create',
      resourceType: 'family',
      resourceId: saved.id,
      newValues: saved as unknown as Record<string, unknown>,
      status: 'success',
    });

    return this.toFamily(saved);
  }

  async getFamily(familyId: string, userId: string): Promise<Family> {
    const family = await this.familyRepository.findOne({
      where: { id: familyId, isActive: true },
    });

    if (!family) throw new NotFoundException('Family not found');

    const hasAccess = family.founderId === userId || await this.isMember(familyId, userId);
    if (!hasAccess) throw new NotFoundException('Family not found');

    return this.toFamily(family);
  }

  async getUserFamilies(userId: string): Promise<Family[]> {
    // Families where user is founder
    const founded = await this.familyRepository.find({
      where: { founderId: userId, isActive: true },
    });

    // Families where user is an approved member but not founder
    const memberships = await this.memberRepository.find({
      where: { userId, isApproved: true },
    });
    const memberFamilyIds = memberships
      .map((m) => m.familyId)
      .filter((id) => !founded.some((f) => f.id === id));

    let memberFamilies: FamilyEntity[] = [];
    if (memberFamilyIds.length > 0) {
      memberFamilies = await this.familyRepository
        .createQueryBuilder('f')
        .where('f.id IN (:...ids) AND f.isActive = true', { ids: memberFamilyIds })
        .orderBy('f.createdAt', 'DESC')
        .getMany();
    }

    return [...founded, ...memberFamilies]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((f) => this.toFamily(f));
  }

  async inviteMember(
    familyId: string,
    email: string,
    role: string,
    invitedBy: string,
  ): Promise<{ invitationId: string; familyId: string; email: string; role: string; createdAt: Date }> {
    const family = await this.familyRepository.findOne({ where: { id: familyId } });
    if (!family) throw new NotFoundException('Family not found');

    const isAdmin = family.founderId === invitedBy || await this.isMemberWithRole(familyId, invitedBy, ['admin', 'elder']);
    if (!isAdmin) throw new ForbiddenException('Only admins and elders can invite members');

    // invitationId is a placeholder until email-based invite flow is implemented;
    // the family_members row is created directly (no email token yet)
    return {
      invitationId: `inv_${Date.now()}`,
      familyId,
      email,
      role,
      createdAt: new Date(),
    };
  }

  async addMemberById(familyId: string, userId: string, role: string, invitedBy?: string): Promise<FamilyMemberEntity> {
    const existing = await this.memberRepository.findOne({ where: { familyId, userId } });
    if (existing) {
      existing.role = role;
      return this.memberRepository.save(existing);
    }

    const member = this.memberRepository.create({
      familyId,
      userId,
      role,
      isApproved: true,
      invitedBy,
    });
    return this.memberRepository.save(member);
  }

  async getMembers(familyId: string): Promise<FamilyMemberEntity[]> {
    return this.memberRepository.find({ where: { familyId, isApproved: true } });
  }

  async isMember(familyId: string, userId: string): Promise<boolean> {
    const count = await this.memberRepository.count({ where: { familyId, userId, isApproved: true } });
    return count > 0;
  }

  private async isMemberWithRole(familyId: string, userId: string, roles: string[]): Promise<boolean> {
    const member = await this.memberRepository.findOne({ where: { familyId, userId, isApproved: true } });
    return !!member && roles.includes(member.role);
  }

  private toFamily(entity: FamilyEntity): Family {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      founderId: entity.founderId,
      profileImageUrl: entity.profileImageUrl,
      ancestralVillage: entity.ancestralVillage,
      ancestralDistrict: entity.ancestralDistrict,
      ancestralProvince: entity.ancestralProvince,
      metadata: {},
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
