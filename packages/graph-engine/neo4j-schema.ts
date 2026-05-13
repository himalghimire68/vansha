// ============================================
// NEO4J GRAPH DATABASE SCHEMA
// ============================================
// Production-grade Cypher queries and node/relationship definitions
// Supports genealogical graph traversal and relationship detection

// ============================================
// NODE DEFINITIONS
// ============================================

/**
 * Person Node
 * Represents an individual in the genealogical graph
 * 
 * Properties:
 * - id (UUID): Unique identifier
 * - firstName: Given name
 * - lastName: Family name
 * - gender: MALE, FEMALE, OTHER
 * - birthDate: ISO 8601 date
 * - deathDate: ISO 8601 date or null
 * - isLiving: Boolean flag
 * - gotra: Nepali gotra (lineage group)
 * - caste: Caste identifier
 * - ancestralVillage: Birth/ancestral location
 */

// (:Person {
//   id: UUID,
//   firstName: String,
//   lastName: String,
//   nepaliName: String,
//   gender: String,
//   birthDate: Date,
//   deathDate: Date,
//   isLiving: Boolean,
//   gotra: String,
//   caste: String,
//   ancestralVillage: String,
//   createdAt: DateTime,
//   updatedAt: DateTime,
//   familyId: UUID
// })

/**
 * Family Node
 * Represents a family tree root
 */

// (:Family {
//   id: UUID,
//   name: String,
//   createdAt: DateTime,
//   updatedAt: DateTime
// })

/**
 * User Node
 * Represents system users (for audit trails)
 */

// (:User {
//   id: UUID,
//   clerkId: String,
//   email: String,
//   firstName: String,
//   lastName: String
// })

// ============================================
// RELATIONSHIP DEFINITIONS
// ============================================

/**
 * FATHER_OF relationship
 * Directed from father to child
 * Used for paternal line traversal
 */

// (:Person)-[:FATHER_OF]->(:Person)
// Properties: createdAt, createdBy

/**
 * MOTHER_OF relationship
 * Directed from mother to child
 * Used for maternal line traversal
 */

// (:Person)-[:MOTHER_OF]->(:Person)
// Properties: createdAt, createdBy

/**
 * MARRIED_TO relationship
 * Undirected (bidirectional in practice)
 * Connects spouses
 */

// (:Person)-[:MARRIED_TO]->(:Person)
// Properties: marriageDate, createdAt

/**
 * SIBLING_OF relationship
 * Inferred from shared parents
 * Used for cousin calculations
 */

// (:Person)-[:SIBLING_OF]->(:Person)
// Properties: sharedParents (array)

/**
 * ADOPTED_BY relationship
 * Directed from adopted child to adoptive parent
 */

// (:Person)-[:ADOPTED_BY]->(:Person)
// Properties: adoptionDate, createdAt

/**
 * DESCENDANT_OF relationship
 * Computed relationship for optimization
 * Used for quick ancestor verification
 */

// (:Person)-[:DESCENDANT_OF]->(:Person)
// Properties: generations (distance), computedAt

/**
 * BELONGS_TO relationship
 * Connects person to family tree
 */

// (:Person)-[:BELONGS_TO]->(:Family)
// Properties: addedAt, addedBy

/**
 * CREATED_BY relationship
 * Audit trail for data lineage
 */

// (:Person)-[:CREATED_BY]->(:User)
// Properties: timestamp

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================

/*
CREATE INDEX idx_person_id FOR (p:Person) ON (p.id);
CREATE INDEX idx_person_family_id FOR (p:Person) ON (p.familyId);
CREATE INDEX idx_person_full_name FOR (p:Person) ON (p.firstName, p.lastName);
CREATE INDEX idx_person_gotra FOR (p:Person) ON (p.gotra);
CREATE INDEX idx_person_caste FOR (p:Person) ON (p.caste);
CREATE INDEX idx_person_ancestral_village FOR (p:Person) ON (p.ancestralVillage);
CREATE INDEX idx_person_is_living FOR (p:Person) ON (p.isLiving);
CREATE INDEX idx_family_id FOR (f:Family) ON (f.id);
CREATE INDEX idx_user_id FOR (u:User) ON (u.id);
CREATE INDEX idx_user_clerk_id FOR (u:User) ON (u.clerkId);
*/

// ============================================
// INITIALIZATION SCRIPT
// ============================================

const initializeNeo4jSchema = `
// Drop existing indexes and constraints
MATCH (n) DETACH DELETE n;

// Create indexes
CREATE INDEX idx_person_id FOR (p:Person) ON (p.id);
CREATE INDEX idx_person_family_id FOR (p:Person) ON (p.familyId);
CREATE INDEX idx_person_full_name FOR (p:Person) ON (p.firstName, p.lastName);
CREATE INDEX idx_person_gotra FOR (p:Person) ON (p.gotra);
CREATE INDEX idx_person_is_living FOR (p:Person) ON (p.isLiving);
CREATE INDEX idx_family_id FOR (f:Family) ON (f.id);
CREATE UNIQUENESS CONSTRAINT unique_person_id FOR (p:Person) REQUIRE p.id IS UNIQUE;
CREATE UNIQUENESS CONSTRAINT unique_family_id FOR (f:Family) REQUIRE f.id IS UNIQUE;
CREATE UNIQUENESS CONSTRAINT unique_user_id FOR (u:User) REQUIRE u.id IS UNIQUE;
`;

// ============================================
// CORE QUERIES - RETRIEVAL
// ============================================

/**
 * Get a person and their immediate family
 */
const getPersonWithFamily = `
MATCH (p:Person {id: $personId})
OPTIONAL MATCH (p)-[:FATHER_OF]->(child:Person)
OPTIONAL MATCH (p)-[:MOTHER_OF]->(child2:Person)
OPTIONAL MATCH (p)-[:MARRIED_TO]-(spouse:Person)
OPTIONAL MATCH (father:Person)-[:FATHER_OF]->(p)
OPTIONAL MATCH (mother:Person)-[:MOTHER_OF]->(p)
RETURN 
  p as person,
  collect(DISTINCT child) as children,
  collect(DISTINCT child2) as childrenFromMother,
  spouse,
  father,
  mother
`;

/**
 * Get N generations of ancestors
 */
const getAncestors = `
MATCH path = (p:Person {id: $personId})-[:FATHER_OF|MOTHER_OF*..${3}]-(ancestor:Person)
WITH ancestor, length(path) as distance
RETURN DISTINCT ancestor, distance
ORDER BY distance ASC
`;

/**
 * Get N generations of descendants
 */
const getDescendants = `
MATCH path = (p:Person {id: $personId})<-[:FATHER_OF|MOTHER_OF*..${3}]-(descendant:Person)
WITH descendant, length(path) as distance
RETURN DISTINCT descendant, distance
ORDER BY distance ASC
`;

/**
 * Get all siblings of a person
 */
const getSiblings = `
MATCH (p:Person {id: $personId})-[:SIBLING_OF]-(sibling:Person)
RETURN sibling
`;

/**
 * Get spouses
 */
const getSpouses = `
MATCH (p:Person {id: $personId})-[:MARRIED_TO]-(spouse:Person)
RETURN spouse
`;

// ============================================
// RELATIONSHIP DETECTION QUERIES
// ============================================

/**
 * Find shared ancestors between two people
 * Used for "5th cousin" detection
 */
const findSharedAncestors = `
MATCH (p1:Person {id: $personId1})-[:FATHER_OF|MOTHER_OF*..${10}]-(ancestor:Person)
MATCH (p2:Person {id: $personId2})-[:FATHER_OF|MOTHER_OF*..${10}]-(ancestor)
RETURN DISTINCT ancestor
LIMIT 10
`;

/**
 * Calculate cousin distance
 * Returns shortest path between two people through common ancestor
 */
const calculateCousinDistance = `
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
  [node in nodes(path) | node.id] as path,
  relationships(path) as edges
`;

/**
 * Find relationship between two people
 * Returns: parent-child, sibling, cousin, spouse, etc.
 */
const findRelationshipPath = `
MATCH (p1:Person {id: $personId1})
MATCH (p2:Person {id: $personId2})
WITH p1, p2

// Direct parent-child
OPTIONAL MATCH directParent = (p1)-[:FATHER_OF|MOTHER_OF]-(p2)

// Direct spouse
OPTIONAL MATCH directSpouse = (p1)-[:MARRIED_TO]-(p2)

// Direct siblings
OPTIONAL MATCH directSibling = (p1)-[:SIBLING_OF]-(p2)

// Cousin (shared grandparent)
OPTIONAL MATCH grandparent_path = (p1)-[:FATHER_OF|MOTHER_OF*2]-(ancestor:Person)-[:FATHER_OF|MOTHER_OF*2]-(p2)

// Ancestor-descendant
OPTIONAL MATCH ancestor_path = (ancestor2:Person)-[:FATHER_OF|MOTHER_OF*]-(p1)
WHERE (ancestor2)-[:FATHER_OF|MOTHER_OF*]-(p2)

RETURN 
  CASE 
    WHEN directParent IS NOT NULL THEN 'PARENT_CHILD'
    WHEN directSpouse IS NOT NULL THEN 'SPOUSE'
    WHEN directSibling IS NOT NULL THEN 'SIBLING'
    WHEN grandparent_path IS NOT NULL THEN 'COUSIN'
    WHEN ancestor_path IS NOT NULL THEN 'ANCESTOR'
    ELSE 'DISTANT_RELATIVE'
  END as relationshipType,
  {
    path: directParent,
    distance: length(directParent)
  } as pathDetails
`;

/**
 * Detect restricted lineage
 * Check if two people are within forbidden marriage distance
 * Configurable threshold (default: 5 generations)
 */
const detectRestrictedLineage = `
MATCH (p1:Person {id: $personId1})
MATCH (p2:Person {id: $personId2})
MATCH path = shortestPath(
  (p1)-[:FATHER_OF|MOTHER_OF|MARRIED_TO*..5]-(p2)
)
WHERE length(path) <= $threshold
RETURN 
  p1, p2,
  length(path) as distance,
  [node in nodes(path) | node.id] as path,
  CASE 
    WHEN length(path) <= 3 THEN true
    ELSE false
  END as isRestricted
`;

/**
 * Find all people with shared gotra
 * Used for detecting likely clan relations
 */
const findPeopleWithSharedGotra = `
MATCH (p1:Person {id: $personId})
MATCH (p2:Person {gotra: p1.gotra, familyId: p1.familyId})
WHERE p1 <> p2
RETURN p2
LIMIT 20
`;

// ============================================
// ADVANCED QUERIES - GRAPH ANALYSIS
// ============================================

/**
 * Get family tree statistics
 * Total people, generations, etc.
 */
const getFamilyTreeStats = `
MATCH (f:Family {id: $familyId})
MATCH (p:Person)-[:BELONGS_TO]->(f)
WITH f, COUNT(DISTINCT p) as total_people

MATCH (root:Person)-[:BELONGS_TO]->(f)
WHERE NOT ()-[:FATHER_OF|MOTHER_OF]->(root)
  AND NOT ()-[:MOTHER_OF|MOTHER_OF]->(root)

MATCH path = (root)-[:FATHER_OF|MOTHER_OF*..${10}]->(descendant:Person)
WITH total_people, MAX(length(path)) as max_depth

RETURN {
  totalPeople: total_people,
  maxGenerations: max_depth,
  estimatedAncestors: total_people * 0.3
}
`;

/**
 * Get generation breakdown
 * Count people by generation level
 */
const getGenerationBreakdown = `
MATCH (p:Person)-[:BELONGS_TO]->(:Family {id: $familyId})
OPTIONAL MATCH (root:Person)-[:BELONGS_TO]->(:Family {id: $familyId})
WHERE NOT ()-[:FATHER_OF|MOTHER_OF]->(root)
WITH root, p

MATCH path = (root)-[:FATHER_OF|MOTHER_OF*]-(p)
WITH p, length(path) as generation
RETURN 
  generation,
  COUNT(DISTINCT p) as count
ORDER BY generation
`;

/**
 * Find most connected people (hubs)
 * Identifies key individuals in the family network
 */
const findMostConnectedPeople = `
MATCH (p:Person)-[:BELONGS_TO]->(:Family {id: $familyId})
WITH p, 
  size((p)-[:FATHER_OF|MOTHER_OF|MARRIED_TO|SIBLING_OF]-()) as connections
ORDER BY connections DESC
RETURN p, connections
LIMIT 10
`;

/**
 * Detect data quality issues
 * Find people with missing critical information
 */
const detectDataQualityIssues = `
MATCH (p:Person)-[:BELONGS_TO]->(:Family {id: $familyId})
WHERE (p.firstName IS NULL OR p.lastName IS NULL)
  OR (p.isLiving = true AND p.deathDate IS NOT NULL)
  OR (p.isLiving = false AND p.deathDate IS NULL)
RETURN p, [
  CASE WHEN p.firstName IS NULL THEN 'MISSING_FIRST_NAME' END,
  CASE WHEN p.lastName IS NULL THEN 'MISSING_LAST_NAME' END,
  CASE WHEN p.isLiving = true AND p.deathDate IS NOT NULL THEN 'CONFLICTING_LIFE_STATUS' END,
  CASE WHEN p.isLiving = false AND p.deathDate IS NULL THEN 'MISSING_DEATH_DATE' END
] as issues
`;

// ============================================
// MUTATION QUERIES
// ============================================

/**
 * Create a person node
 */
const createPerson = `
CREATE (p:Person {
  id: $id,
  familyId: $familyId,
  firstName: $firstName,
  lastName: $lastName,
  nepaliName: $nepaliName,
  gender: $gender,
  birthDate: $birthDate,
  deathDate: $deathDate,
  isLiving: $isLiving,
  gotra: $gotra,
  caste: $caste,
  ancestralVillage: $ancestralVillage,
  createdAt: datetime(),
  updatedAt: datetime()
})
RETURN p
`;

/**
 * Create FATHER_OF relationship
 */
const createFatherRelationship = `
MATCH (father:Person {id: $fatherId})
MATCH (child:Person {id: $childId})
CREATE (father)-[:FATHER_OF {
  createdAt: datetime(),
  createdBy: $userId
}]->(child)
RETURN father, child
`;

/**
 * Create MOTHER_OF relationship
 */
const createMotherRelationship = `
MATCH (mother:Person {id: $motherId})
MATCH (child:Person {id: $childId})
CREATE (mother)-[:MOTHER_OF {
  createdAt: datetime(),
  createdBy: $userId
}]->(child)
RETURN mother, child
`;

/**
 * Create MARRIED_TO relationship
 */
const createMarriageRelationship = `
MATCH (p1:Person {id: $personId1})
MATCH (p2:Person {id: $personId2})
CREATE (p1)-[:MARRIED_TO {
  marriageDate: $marriageDate,
  createdAt: datetime(),
  createdBy: $userId
}]->(p2)
CREATE (p2)-[:MARRIED_TO {
  marriageDate: $marriageDate,
  createdAt: datetime(),
  createdBy: $userId
}]->(p1)
RETURN p1, p2
`;

/**
 * Update person node
 */
const updatePerson = `
MATCH (p:Person {id: $personId})
SET 
  p.firstName = COALESCE($firstName, p.firstName),
  p.lastName = COALESCE($lastName, p.lastName),
  p.birthDate = COALESCE($birthDate, p.birthDate),
  p.deathDate = COALESCE($deathDate, p.deathDate),
  p.isLiving = COALESCE($isLiving, p.isLiving),
  p.updatedAt = datetime()
RETURN p
`;

// ============================================
// EXPORT QUERIES FOR APPLICATION
// ============================================

export const neo4jQueries = {
  // Retrieval
  getPersonWithFamily,
  getAncestors,
  getDescendants,
  getSiblings,
  getSpouses,
  
  // Relationship Detection
  findSharedAncestors,
  calculateCousinDistance,
  findRelationshipPath,
  detectRestrictedLineage,
  findPeopleWithSharedGotra,
  
  // Analysis
  getFamilyTreeStats,
  getGenerationBreakdown,
  findMostConnectedPeople,
  detectDataQualityIssues,
  
  // Mutations
  createPerson,
  createFatherRelationship,
  createMotherRelationship,
  createMarriageRelationship,
  updatePerson,
};

export default neo4jQueries;
