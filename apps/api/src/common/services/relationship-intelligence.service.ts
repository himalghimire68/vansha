import { Injectable } from '@nestjs/common';
import { GraphDatabaseService } from './graph-database.service';

/**
 * Relationship Intelligence Engine
 * Core business logic for detecting relationships, cousins, and lineage paths
 */
@Injectable()
export class RelationshipIntelligenceService {
  constructor(private graphDatabase: GraphDatabaseService) {}

  /**
   * Detect relationship between two people
   * Returns detailed relationship information
   */
  async detectRelationship(personId1: string, personId2: string) {
    // Find if they're the same person
    if (personId1 === personId2) {
      return {
        type: 'SELF',
        distance: 0,
        description: 'Same person',
        path: [personId1],
      };
    }

    // Check for spouse
    const spouseCheck = await this.graphDatabase.query<any>(
      `MATCH (p1:Person {id: $personId1})-[:MARRIED_TO]-(p2:Person {id: $personId2})
       RETURN p2 LIMIT 1`,
      { personId1, personId2 }
    );
    if (spouseCheck.length > 0) {
      return {
        type: 'SPOUSE',
        distance: 1,
        description: 'Married to each other',
        path: [personId1, personId2],
      };
    }

    // Check for parent-child
    const childCheck = await this.graphDatabase.query<any>(
      `MATCH (p1:Person {id: $personId1})-[:FATHER_OF|MOTHER_OF]->(p2:Person {id: $personId2})
       RETURN p1, p2 LIMIT 1`,
      { personId1, personId2 }
    );
    if (childCheck.length > 0) {
      return {
        type: 'CHILD',
        distance: 1,
        description: 'Direct child',
        path: [personId1, personId2],
      };
    }

    // Check for sibling (same parents)
    const siblingCheck = await this.graphDatabase.query<any>(
      `MATCH (parent)-[:FATHER_OF|MOTHER_OF]->(p1:Person {id: $personId1})
       MATCH (parent)-[:FATHER_OF|MOTHER_OF]->(p2:Person {id: $personId2})
       WHERE p1 <> p2
       RETURN p1, p2 LIMIT 1`,
      { personId1, personId2 }
    );
    if (siblingCheck.length > 0) {
      return {
        type: 'SIBLING',
        distance: 2,
        description: 'Brother or sister',
        path: [personId1, 'parent', personId2],
      };
    }

    // Try to find shortest path for cousin relationships
    const cousinPath = await this.findCousinRelationship(personId1, personId2);
    if (cousinPath) {
      return cousinPath;
    }

    // Try to find any relationship path
    const anyPath = await this.findAnyRelationshipPath(personId1, personId2);
    return anyPath || {
      type: 'UNKNOWN',
      distance: null,
      description: 'No direct relationship found',
      path: null,
    };
  }

  /**
   * Find cousin relationships (nth degree cousins)
   */
  private async findCousinRelationship(personId1: string, personId2: string) {
    // Find common ancestors
    const commonAncestors = await this.graphDatabase.query<any>(
      `MATCH (p1:Person {id: $personId1})-[:FATHER_OF|MOTHER_OF*1..10]-(ancestor:Person)
       MATCH (p2:Person {id: $personId2})-[:FATHER_OF|MOTHER_OF*1..10]-(ancestor)
       WHERE p1 <> p2
       RETURN ancestor, 
              length((p1)-[:FATHER_OF|MOTHER_OF*]-(ancestor)) as distance1,
              length((p2)-[:FATHER_OF|MOTHER_OF*]-(ancestor)) as distance2
       ORDER BY distance1 + distance2 ASC
       LIMIT 1`,
      { personId1, personId2 }
    );

    if (commonAncestors.length === 0) {
      return null;
    }

    const ancestor = commonAncestors[0];
    const cousinDegree = Math.min(ancestor.distance1, ancestor.distance2) - 1;
    const generationDifference = Math.abs(ancestor.distance1 - ancestor.distance2);

    let relationshipType = 'COUSIN';
    let description = 'Cousin';

    if (cousinDegree === 0) {
      relationshipType = 'PARENT';
      description = generationDifference === 1 ? 'Parent' : `Ancestor (${generationDifference} generations)`;
    } else if (cousinDegree === 1) {
      relationshipType = generationDifference === 0 ? 'COUSIN_1ST' : 'COUSIN_1ST_REMOVED';
      description = generationDifference === 0 ? 'First cousin' : 'First cousin once removed';
    } else if (cousinDegree === 2) {
      relationshipType = generationDifference === 0 ? 'COUSIN_2ND' : 'COUSIN_2ND_REMOVED';
      description = generationDifference === 0 ? 'Second cousin' : 'Second cousin once removed';
    } else {
      description = `${this.ordinalSuffix(cousinDegree)} cousin${generationDifference > 0 ? ` (${generationDifference}x removed)` : ''}`;
    }

    return {
      type: relationshipType,
      distance: ancestor.distance1 + ancestor.distance2,
      description,
      commonAncestor: ancestor.ancestor,
      path: null, // Could be calculated if needed
    };
  }

  /**
   * Find any relationship path between two people
   */
  private async findAnyRelationshipPath(personId1: string, personId2: string) {
    const pathResult = await this.graphDatabase.query<any>(
      `MATCH path = shortestPath(
         (p1:Person {id: $personId1})-[:FATHER_OF|MOTHER_OF|MARRIED_TO*1..20]-(p2:Person {id: $personId2})
       )
       RETURN [node in nodes(path) | {id: node.id, name: node.firstName + ' ' + node.lastName}] as nodes,
              [rel in relationships(path) | type(rel)] as relationships,
              length(path) as distance
       LIMIT 1`,
      { personId1, personId2 }
    );

    if (pathResult.length === 0) {
      return null;
    }

    const result = pathResult[0];
    return {
      type: 'DISTANT_RELATIVE',
      distance: result.distance,
      description: 'Distant relative',
      path: result.nodes,
      relationships: result.relationships,
    };
  }

  /**
   * Find all descendants of a person
   */
  async findDescendants(personId: string, maxGenerations: number = 10) {
    return this.graphDatabase.query<any>(
      `MATCH (p:Person {id: $personId})-[:FATHER_OF|MOTHER_OF*1..${maxGenerations}]->(descendant:Person)
       RETURN DISTINCT descendant
       ORDER BY descendant.firstName`,
      { personId }
    );
  }

  /**
   * Find all ancestors of a person
   */
  async findAncestors(personId: string, maxGenerations: number = 10) {
    return this.graphDatabase.query<any>(
      `MATCH (p:Person {id: $personId})-[:FATHER_OF|MOTHER_OF*1..${maxGenerations}]-(ancestor:Person)
       RETURN DISTINCT ancestor
       ORDER BY ancestor.firstName`,
      { personId }
    );
  }

  /**
   * Find all siblings of a person (share at least one parent)
   */
  async findSiblings(personId: string) {
    return this.graphDatabase.query<any>(
      `MATCH (parent)-[:FATHER_OF|MOTHER_OF]->(p:Person {id: $personId})
       MATCH (parent)-[:FATHER_OF|MOTHER_OF]->(sibling:Person)
       WHERE p <> sibling
       RETURN DISTINCT sibling`,
      { personId }
    );
  }

  /**
   * Check if a person is in a restricted lineage for marriage purposes
   * (Within configured number of generations based on cultural rules)
   */
  async checkLineageCompatibility(personId1: string, personId2: string, restrictionLevel: number = 3) {
    // In Nepalese culture, typically cannot marry within same clan/gotra and certain generations
    const sharedAncestors = await this.graphDatabase.query<any>(
      `MATCH (p1:Person {id: $personId1})-[:FATHER_OF|MOTHER_OF*1..${restrictionLevel}]-(ancestor:Person)
       MATCH (p2:Person {id: $personId2})-[:FATHER_OF|MOTHER_OF*1..${restrictionLevel}]-(ancestor)
       RETURN DISTINCT ancestor`,
      { personId1, personId2 }
    );

    return {
      compatible: sharedAncestors.length === 0,
      sharedAncestorCount: sharedAncestors.length,
      message: sharedAncestors.length === 0 
        ? 'No restricted shared ancestry detected'
        : `Found ${sharedAncestors.length} shared ancestor(s) within restriction level`,
    };
  }

  /**
   * Find all family members of a person (extended family)
   */
  async findFamilyNetwork(personId: string, depth: number = 3) {
    return this.graphDatabase.query<any>(
      `MATCH (p:Person {id: $personId})-[:FATHER_OF|MOTHER_OF|MARRIED_TO*1..${depth}]-(familyMember:Person)
       RETURN DISTINCT familyMember
       ORDER BY familyMember.firstName`,
      { personId }
    );
  }

  /**
   * Calculate generation distance between two people
   */
  async calculateGenerationDistance(personId1: string, personId2: string) {
    const pathResult = await this.graphDatabase.query<any>(
      `MATCH path = shortestPath(
         (p1:Person {id: $personId1})-[:FATHER_OF|MOTHER_OF*]-(p2:Person {id: $personId2})
       )
       RETURN length(path) as distance`,
      { personId1, personId2 }
    );

    return pathResult.length > 0 ? pathResult[0].distance : null;
  }

  /**
   * Helper function for ordinal suffixes (1st, 2nd, 3rd, etc.)
   */
  private ordinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
  }
}
