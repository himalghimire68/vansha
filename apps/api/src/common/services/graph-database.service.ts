import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Neo4jDriver, neo4j } from 'neo4j-driver';

/**
 * Neo4j Graph Database Service
 * Handles genealogical relationship queries and traversal
 */
@Injectable()
export class GraphDatabaseService {
  private driver: Neo4jDriver;

  constructor(private configService: ConfigService) {
    const uri = this.configService.get('NEO4J_URI');
    const username = this.configService.get('NEO4J_USERNAME');
    const password = this.configService.get('NEO4J_PASSWORD');
    const database = this.configService.get('NEO4J_DATABASE');

    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      encrypted: this.configService.get('NEO4J_ENCRYPTED') === 'true',
    });
  }

  /**
   * Execute a Cypher query
   */
  async query<T>(cypher: string, params: Record<string, unknown> = {}): Promise<T[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(cypher, params);
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  /**
   * Get person with immediate family (parents, spouse, children)
   */
  async getPersonWithFamily(personId: string) {
    const cypher = `
      MATCH (p:Person {id: $personId})
      OPTIONAL MATCH (p)-[:FATHER_OF]->(child:Person)
      OPTIONAL MATCH (p)-[:MOTHER_OF]->(child2:Person)
      OPTIONAL MATCH (p)-[:MARRIED_TO]-(spouse:Person)
      OPTIONAL MATCH (father:Person)-[:FATHER_OF]->(p)
      OPTIONAL MATCH (mother:Person)-[:MOTHER_OF]->(p)
      RETURN 
        p as person,
        collect(DISTINCT child) as children,
        spouse,
        father,
        mother
    `;
    const results = await this.query<any>(cypher, { personId });
    return results[0];
  }

  /**
   * Find shared ancestors between two people
   * Used for cousin detection and lineage validation
   */
  async findSharedAncestors(personId1: string, personId2: string, maxGenerations: number = 10) {
    const cypher = `
      MATCH (p1:Person {id: $personId1})-[:FATHER_OF|MOTHER_OF*..${maxGenerations}]-(ancestor:Person)
      MATCH (p2:Person {id: $personId2})-[:FATHER_OF|MOTHER_OF*..${maxGenerations}]-(ancestor)
      RETURN DISTINCT ancestor
      LIMIT 10
    `;
    return this.query<any>(cypher, { personId1, personId2 });
  }

  /**
   * Calculate cousin distance
   * Returns the relationship type and path length
   */
  async calculateCousinDistance(personId1: string, personId2: string) {
    const cypher = `
      MATCH (p1:Person {id: $personId1})
      MATCH (p2:Person {id: $personId2})
      MATCH path = shortestPath(
        (p1)-[:FATHER_OF|MOTHER_OF|MARRIED_TO*]-(p2)
      )
      WHERE p1.familyId = p2.familyId
      RETURN 
        p1,
        p2,
        length(path) as distance,
        [node in nodes(path) | node.id] as pathIds
    `;
    const results = await this.query<any>(cypher, { personId1, personId2 });
    return results[0];
  }

  /**
   * Create a person node
   */
  async createPerson(data: {
    id: string;
    familyId: string;
    firstName: string;
    lastName: string;
    gender: string;
    isLiving: boolean;
  }) {
    const cypher = `
      CREATE (p:Person {
        id: $id,
        familyId: $familyId,
        firstName: $firstName,
        lastName: $lastName,
        gender: $gender,
        isLiving: $isLiving,
        createdAt: datetime()
      })
      RETURN p
    `;
    return this.query<any>(cypher, data);
  }

  /**
   * Create FATHER_OF relationship
   */
  async createFatherRelationship(fatherId: string, childId: string) {
    const cypher = `
      MATCH (father:Person {id: $fatherId})
      MATCH (child:Person {id: $childId})
      CREATE (father)-[:FATHER_OF {createdAt: datetime()}]->(child)
      RETURN father, child
    `;
    return this.query<any>(cypher, { fatherId, childId });
  }

  /**
   * Create MOTHER_OF relationship
   */
  async createMotherRelationship(motherId: string, childId: string) {
    const cypher = `
      MATCH (mother:Person {id: $motherId})
      MATCH (child:Person {id: $childId})
      CREATE (mother)-[:MOTHER_OF {createdAt: datetime()}]->(child)
      RETURN mother, child
    `;
    return this.query<any>(cypher, { motherId, childId });
  }

  /**
   * Cleanup: Close the Neo4j connection
   */
  async onModuleDestroy(): Promise<void> {
    await this.driver.close();
  }
}
