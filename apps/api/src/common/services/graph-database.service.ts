import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Neo4j Graph Database Service
 * Optional — degrades gracefully when Neo4j URI is not configured.
 * All methods return empty results when disconnected.
 */
@Injectable()
export class GraphDatabaseService implements OnModuleDestroy {
  private driver: any = null;
  private connected = false;

  constructor(private configService: ConfigService) {
    this.initDriver();
  }

  private initDriver() {
    const uri = this.configService.get<string>('NEO4J_URI');
    if (!uri) {
      console.warn('[GraphDB] NEO4J_URI not configured — running without graph database');
      return;
    }

    try {
      // Dynamic import so the package error doesn't crash the app when Neo4j is absent
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const neo4j = require('neo4j-driver');
      const username = this.configService.get('NEO4J_USERNAME') || 'neo4j';
      const password = this.configService.get('NEO4J_PASSWORD') || '';
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
        encrypted: this.configService.get('NEO4J_ENCRYPTED') === 'true',
      });
      this.connected = true;
      console.log('[GraphDB] Neo4j driver initialised');
    } catch (err: any) {
      console.warn('[GraphDB] Failed to initialise Neo4j driver:', err.message);
    }
  }

  async query<T>(cypher: string, params: Record<string, unknown> = {}): Promise<T[]> {
    if (!this.connected || !this.driver) return [];
    const session = this.driver.session();
    try {
      const result = await session.run(cypher, params);
      return result.records.map((r: any) => r.toObject() as T);
    } catch (err: any) {
      console.warn('[GraphDB] Query failed:', err.message);
      return [];
    } finally {
      await session.close();
    }
  }

  async getPersonWithFamily(personId: string) {
    const results = await this.query<any>(
      `MATCH (p:Person {id: $personId})
       OPTIONAL MATCH (p)-[:FATHER_OF]->(child:Person)
       OPTIONAL MATCH (p)-[:MOTHER_OF]->(child2:Person)
       OPTIONAL MATCH (p)-[:MARRIED_TO]-(spouse:Person)
       OPTIONAL MATCH (father:Person)-[:FATHER_OF]->(p)
       OPTIONAL MATCH (mother:Person)-[:MOTHER_OF]->(p)
       RETURN p as person, collect(DISTINCT child) as children, spouse, father, mother`,
      { personId },
    );
    return results[0] ?? null;
  }

  async findSharedAncestors(personId1: string, personId2: string, maxGenerations = 10) {
    return this.query<any>(
      `MATCH (p1:Person {id: $personId1})-[:FATHER_OF|MOTHER_OF*..${maxGenerations}]-(ancestor:Person)
       MATCH (p2:Person {id: $personId2})-[:FATHER_OF|MOTHER_OF*..${maxGenerations}]-(ancestor)
       RETURN DISTINCT ancestor LIMIT 10`,
      { personId1, personId2 },
    );
  }

  async calculateCousinDistance(personId1: string, personId2: string) {
    const results = await this.query<any>(
      `MATCH (p1:Person {id: $personId1}), (p2:Person {id: $personId2})
       MATCH path = shortestPath((p1)-[:FATHER_OF|MOTHER_OF|MARRIED_TO*]-(p2))
       WHERE p1.familyId = p2.familyId
       RETURN p1, p2, length(path) as distance, [node in nodes(path) | node.id] as pathIds`,
      { personId1, personId2 },
    );
    return results[0] ?? null;
  }

  async createPerson(data: {
    id: string;
    familyId: string;
    firstName: string;
    lastName: string;
    gender: string;
    isLiving: boolean;
  }) {
    return this.query<any>(
      `CREATE (p:Person {id: $id, familyId: $familyId, firstName: $firstName,
         lastName: $lastName, gender: $gender, isLiving: $isLiving, createdAt: datetime()})
       RETURN p`,
      data,
    );
  }

  async createFatherRelationship(fatherId: string, childId: string) {
    return this.query<any>(
      `MATCH (f:Person {id: $fatherId}), (c:Person {id: $childId})
       CREATE (f)-[:FATHER_OF {createdAt: datetime()}]->(c)
       RETURN f, c`,
      { fatherId, childId },
    );
  }

  async createMotherRelationship(motherId: string, childId: string) {
    return this.query<any>(
      `MATCH (m:Person {id: $motherId}), (c:Person {id: $childId})
       CREATE (m)-[:MOTHER_OF {createdAt: datetime()}]->(c)
       RETURN m, c`,
      { motherId, childId },
    );
  }

  async findAncestors(personId: string, maxGenerations = 10) {
    return this.query<any>(
      `MATCH (p:Person {id: $personId})-[:FATHER_OF|MOTHER_OF*1..${maxGenerations}]-(ancestor:Person)
       RETURN DISTINCT ancestor ORDER BY ancestor.firstName`,
      { personId },
    );
  }

  async findDescendants(personId: string, maxGenerations = 10) {
    return this.query<any>(
      `MATCH (p:Person {id: $personId})-[:FATHER_OF|MOTHER_OF*1..${maxGenerations}]->(desc:Person)
       RETURN DISTINCT desc ORDER BY desc.firstName`,
      { personId },
    );
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
    }
  }
}
