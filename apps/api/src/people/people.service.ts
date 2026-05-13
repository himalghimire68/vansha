import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePersonRequest, Person } from '@vansha/shared-types';
import { GraphDatabaseService } from '../common/services/graph-database.service';
import { AuditService } from '../common/services/audit.service';

/**
 * People Service
 * Business logic for genealogical data management
 */
@Injectable()
export class PeopleService {
  constructor(
    private graphDatabaseService: GraphDatabaseService,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new person in the family tree
   */
  async createPerson(
    familyId: string,
    data: CreatePersonRequest,
    userId: string,
  ): Promise<Person> {
    // TODO: Implement database insert
    const personId = `person_${Date.now()}`;

    const person: Person = {
      id: personId,
      familyId,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      birthDate: data.birthDate,
      birthDateAccuracy: data.birthDateAccuracy || 'unknown',
      deathDate: data.deathDate,
      deathDateAccuracy: data.deathDateAccuracy || 'unknown',
      isLiving: !data.deathDate,
      nepaliName: data.nepaliName,
      gotra: data.gotra,
      caste: data.caste,
      ancestralVillage: data.ancestralVillage,
      ancestralCountry: 'Nepal',
      privacyLevel: 'family',
      birthVisibility: 'family',
      deathVisibility: 'family',
      relationVisibility: 'family',
      memorialEnabled: false,
      isVerified: false,
      createdBy: userId,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create in Neo4j
    try {
      await this.graphDatabaseService.createPerson({
        id: personId,
        familyId,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender as string,
        isLiving: !data.deathDate,
      });
    } catch (error) {
      console.error('Failed to create person in Neo4j:', error);
    }

    // Audit log
    await this.auditService.log({
      actorId: userId,
      action: 'create',
      resourceType: 'person',
      resourceId: personId,
      familyId,
      newValues: person,
      status: 'success',
    });

    return person;
  }

  /**
   * Get person with family relationships
   */
  async getPerson(personId: string, familyId: string): Promise<any> {
    try {
      return await this.graphDatabaseService.getPersonWithFamily(personId);
    } catch (error) {
      console.error('Failed to fetch person:', error);
      return null;
    }
  }

  /**
   * Get all ancestors
   */
  async getAncestors(personId: string, generations: number = 3): Promise<any[]> {
    // TODO: Implement Neo4j query
    return [];
  }

  /**
   * Get all descendants
   */
  async getDescendants(personId: string, generations: number = 3): Promise<any[]> {
    // TODO: Implement Neo4j query
    return [];
  }

  /**
   * Find relationship between two people
   */
  async findRelationship(personId1: string, personId2: string): Promise<any> {
    try {
      const sharedAncestors = await this.graphDatabaseService.findSharedAncestors(
        personId1,
        personId2,
      );
      const distance = await this.graphDatabaseService.calculateCousinDistance(
        personId1,
        personId2,
      );

      return {
        distance,
        sharedAncestors: sharedAncestors.length > 0,
      };
    } catch (error) {
      console.error('Failed to find relationship:', error);
      return null;
    }
  }
}
