import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreatePersonRequest } from '@vansha/shared-types';
import { GraphDatabaseService } from '../common/services/graph-database.service';
import { AuditService } from '../common/services/audit.service';
import { PersonEntity } from '../person.entity';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(PersonEntity)
    private personRepository: Repository<PersonEntity>,
    private graphDatabaseService: GraphDatabaseService,
    private auditService: AuditService,
  ) {}

  async createPerson(familyId: string, data: CreatePersonRequest, userId: string): Promise<PersonEntity> {
    const person = this.personRepository.create({
      ...data,
      familyId,
      createdBy: userId,
      isLiving: !data.deathDate,
      birthDate: data.birthDate ? String(data.birthDate) : undefined,
      deathDate: data.deathDate ? String(data.deathDate) : undefined,
      birthDateAccuracy: data.birthDateAccuracy ?? 'unknown',
      deathDateAccuracy: data.deathDateAccuracy ?? 'unknown',
    });

    const saved = await this.personRepository.save(person);

    // Mirror to Neo4j (best-effort — silently skipped when Neo4j unavailable)
    await this.graphDatabaseService.createPerson({
      id: saved.id,
      familyId,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender as string,
      isLiving: saved.isLiving,
    });

    if (data.fatherId) {
      await this.graphDatabaseService.createFatherRelationship(data.fatherId, saved.id);
    }
    if (data.motherId) {
      await this.graphDatabaseService.createMotherRelationship(data.motherId, saved.id);
    }

    await this.auditService.log({
      actorId: userId,
      action: 'create',
      resourceType: 'person',
      resourceId: saved.id,
      familyId,
      newValues: saved as unknown as Record<string, unknown>,
      status: 'success',
    });

    return saved;
  }

  async updatePerson(personId: string, familyId: string, data: Record<string, unknown>, userId: string): Promise<PersonEntity> {
    const person = await this.personRepository.findOne({ where: { id: personId, familyId } });
    if (!person) throw new NotFoundException('Person not found');

    const allowed = ['fatherId', 'motherId', 'biography', 'occupation', 'photoUrl',
      'birthDate', 'deathDate', 'isLiving', 'gotra', 'caste',
      'ancestralVillage', 'ancestralDistrict', 'ancestralProvince', 'nepaliName',
      'birthOrder', 'firstName', 'middleName', 'lastName'];
    for (const key of allowed) {
      if (key in data) (person as any)[key] = data[key] ?? null;
    }

    const saved = await this.personRepository.save(person);

    if (data.fatherId) {
      await this.graphDatabaseService.createFatherRelationship(data.fatherId as string, personId);
    }
    if (data.motherId) {
      await this.graphDatabaseService.createMotherRelationship(data.motherId as string, personId);
    }

    await this.auditService.log({
      actorId: userId,
      action: 'update',
      resourceType: 'person',
      resourceId: personId,
      familyId,
      newValues: data,
      status: 'success',
    });

    return saved;
  }

  async getPerson(personId: string, familyId: string): Promise<PersonEntity> {
    // Try Neo4j first for rich graph data
    const graphResult = await this.graphDatabaseService.getPersonWithFamily(personId);
    if (graphResult) return graphResult;

    // Fall back to SQL
    const person = await this.personRepository.findOne({ where: { id: personId, familyId } });
    if (!person) throw new NotFoundException('Person not found');
    return person;
  }

  async getPeopleByFamily(familyId: string): Promise<PersonEntity[]> {
    return this.personRepository.find({
      where: { familyId },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async getAncestors(personId: string, generations = 3): Promise<PersonEntity[]> {
    // Try Neo4j first
    const graphResult = await this.graphDatabaseService.findAncestors(personId, generations);
    if (graphResult.length > 0) return graphResult;

    // SQL-based recursive ancestor traversal via fatherId/motherId columns
    return this.sqlAncestors(personId, generations);
  }

  async getDescendants(personId: string, generations = 3): Promise<PersonEntity[]> {
    // Try Neo4j first
    const graphResult = await this.graphDatabaseService.findDescendants(personId, generations);
    if (graphResult.length > 0) return graphResult;

    // SQL-based recursive descendant traversal
    return this.sqlDescendants(personId, generations);
  }

  async findRelationship(personId1: string, personId2: string): Promise<any> {
    if (personId1 === personId2) {
      return { type: 'SELF', distance: 0, description: 'Same person' };
    }

    const sharedAncestors = await this.graphDatabaseService.findSharedAncestors(personId1, personId2);
    const distance = await this.graphDatabaseService.calculateCousinDistance(personId1, personId2);

    if (sharedAncestors.length > 0 || distance) {
      return {
        type: 'RELATED',
        sharedAncestors: sharedAncestors.length,
        distance: distance?.distance ?? null,
      };
    }

    // SQL fallback: check direct parent-child
    const p1 = await this.personRepository.findOne({ where: { id: personId1 } });
    const p2 = await this.personRepository.findOne({ where: { id: personId2 } });
    if (!p1 || !p2) return { type: 'UNKNOWN', description: 'One or both people not found' };

    if (p1.fatherId === personId2 || p1.motherId === personId2) {
      return { type: 'PARENT_CHILD', distance: 1, description: `${p2.firstName} is parent of ${p1.firstName}` };
    }
    if (p2.fatherId === personId1 || p2.motherId === personId1) {
      return { type: 'PARENT_CHILD', distance: 1, description: `${p1.firstName} is parent of ${p2.firstName}` };
    }

    return { type: 'NO_DIRECT_LINK', description: 'No direct relationship found in available data' };
  }

  // SQL-based ancestor traversal (up to `depth` generations)
  private async sqlAncestors(personId: string, depth: number): Promise<PersonEntity[]> {
    const visited = new Set<string>();
    const result: PersonEntity[] = [];

    const traverse = async (id: string, remaining: number) => {
      if (remaining <= 0 || visited.has(id)) return;
      visited.add(id);
      const p = await this.personRepository.findOne({ where: { id } });
      if (!p) return;
      if (p.fatherId) {
        const father = await this.personRepository.findOne({ where: { id: p.fatherId } });
        if (father) { result.push(father); await traverse(father.id, remaining - 1); }
      }
      if (p.motherId) {
        const mother = await this.personRepository.findOne({ where: { id: p.motherId } });
        if (mother) { result.push(mother); await traverse(mother.id, remaining - 1); }
      }
    };

    await traverse(personId, depth);
    return result;
  }

  // SQL-based descendant traversal (up to `depth` generations)
  private async sqlDescendants(personId: string, depth: number): Promise<PersonEntity[]> {
    const visited = new Set<string>();
    const result: PersonEntity[] = [];

    const traverse = async (id: string, remaining: number) => {
      if (remaining <= 0 || visited.has(id)) return;
      visited.add(id);
      const children = await this.personRepository.find({
        where: [{ fatherId: id }, { motherId: id }],
      });
      for (const child of children) {
        if (!visited.has(child.id)) {
          result.push(child);
          await traverse(child.id, remaining - 1);
        }
      }
    };

    await traverse(personId, depth);
    return result;
  }
}
