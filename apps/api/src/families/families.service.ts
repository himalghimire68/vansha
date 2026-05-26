import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateFamilyRequest, Family } from '@vansha/shared-types';
import { FamilyEntity } from '../family.entity';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(FamilyEntity)
    private familyRepository: Repository<FamilyEntity>,
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

    // Only the founder can access (extend to RBAC when family_members table is added)
    if (family.founderId !== userId) {
      throw new NotFoundException('Family not found');
    }

    return this.toFamily(family);
  }

  async getUserFamilies(userId: string): Promise<Family[]> {
    const families = await this.familyRepository.find({
      where: { founderId: userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return families.map((f) => this.toFamily(f));
  }

  async inviteMember(
    familyId: string,
    email: string,
    role: string,
    invitedBy: string,
  ): Promise<any> {
    // Verify family exists
    const family = await this.familyRepository.findOne({ where: { id: familyId } });
    if (!family) throw new NotFoundException('Family not found');

    // Invitation persistence will be added when the invitations table is created
    return {
      invitationId: `inv_${Date.now()}`,
      familyId,
      email,
      role,
      invitedBy,
      createdAt: new Date(),
    };
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
