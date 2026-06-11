import { MigrationInterface, QueryRunner } from 'typeorm';

// Run with: npm run db:migrate (PostgreSQL only; SQLite uses synchronize=true)
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email"           VARCHAR NOT NULL UNIQUE,
        "firstName"       VARCHAR,
        "lastName"        VARCHAR,
        "role"            VARCHAR NOT NULL DEFAULT 'member',
        "status"          VARCHAR NOT NULL DEFAULT 'active',
        "phone"           VARCHAR,
        "profileImageUrl" VARCHAR,
        "passwordHash"    VARCHAR,
        "passwordSalt"    VARCHAR,
        "lastLoginAt"     TIMESTAMPTZ,
        "preferences"     TEXT,
        "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deletedAt"       TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "families" (
        "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"              VARCHAR NOT NULL,
        "description"       VARCHAR,
        "founderId"         VARCHAR NOT NULL,
        "profileImageUrl"   VARCHAR,
        "ancestralVillage"  VARCHAR,
        "ancestralDistrict" VARCHAR,
        "ancestralProvince" VARCHAR,
        "isActive"          BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deletedAt"         TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "family_members" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "familyId"   UUID NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
        "userId"     UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role"       VARCHAR NOT NULL DEFAULT 'member',
        "isApproved" BOOLEAN NOT NULL DEFAULT TRUE,
        "invitedBy"  UUID,
        "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE ("familyId", "userId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "people" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "familyId"            UUID NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
        "firstName"           VARCHAR NOT NULL,
        "middleName"          VARCHAR,
        "lastName"            VARCHAR NOT NULL,
        "nepaliName"          VARCHAR,
        "gender"              VARCHAR NOT NULL DEFAULT 'male',
        "birthDate"           TEXT,
        "birthDateAccuracy"   VARCHAR NOT NULL DEFAULT 'unknown',
        "deathDate"           TEXT,
        "deathDateAccuracy"   VARCHAR NOT NULL DEFAULT 'unknown',
        "isLiving"            BOOLEAN NOT NULL DEFAULT TRUE,
        "photoUrl"            VARCHAR,
        "biography"           TEXT,
        "caste"               VARCHAR,
        "subCaste"            VARCHAR,
        "gotra"               VARCHAR,
        "ancestralVillage"    VARCHAR,
        "ancestralDistrict"   VARCHAR,
        "ancestralProvince"   VARCHAR,
        "ancestralCountry"    VARCHAR NOT NULL DEFAULT 'Nepal',
        "occupation"          VARCHAR,
        "birthOrder"          INTEGER,
        "fatherId"            UUID,
        "motherId"            UUID,
        "privacyLevel"        VARCHAR NOT NULL DEFAULT 'family',
        "memorialEnabled"     BOOLEAN NOT NULL DEFAULT FALSE,
        "isVerified"          BOOLEAN NOT NULL DEFAULT FALSE,
        "createdBy"           UUID,
        "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deletedAt"           TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cross_family_links" (
        "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "personId"       UUID NOT NULL REFERENCES "people"("id") ON DELETE CASCADE,
        "linkedParentId" UUID NOT NULL,
        "linkedFamilyId" UUID NOT NULL,
        "linkType"       VARCHAR NOT NULL,
        "createdBy"      UUID,
        "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "approval_requests" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "familyId"         UUID NOT NULL,
        "personId"         UUID NOT NULL,
        "requestedBy"      UUID NOT NULL,
        "approvedBy"       UUID,
        "requestedChanges" TEXT NOT NULL DEFAULT '{}',
        "currentValues"    TEXT NOT NULL DEFAULT '{}',
        "status"           VARCHAR NOT NULL DEFAULT 'pending',
        "rejectionReason"  TEXT,
        "approvedAt"       TIMESTAMPTZ,
        "expiresAt"        TIMESTAMPTZ NOT NULL,
        "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId"      UUID NOT NULL,
        "senderId"    UUID,
        "title"       VARCHAR NOT NULL,
        "message"     TEXT NOT NULL,
        "type"        VARCHAR NOT NULL DEFAULT 'milestone',
        "relatedId"   UUID,
        "relatedType" VARCHAR,
        "isRead"      BOOLEAN NOT NULL DEFAULT FALSE,
        "readAt"      TIMESTAMPTZ,
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gotra_config" (
        "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "gotra"     VARCHAR NOT NULL UNIQUE,
        "nepali"    VARCHAR,
        "surnames"  TEXT NOT NULL DEFAULT '[]',
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "site_config" (
        "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "key"       VARCHAR NOT NULL UNIQUE,
        "value"     TEXT NOT NULL DEFAULT '',
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Indexes for common query patterns
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_people_familyId" ON "people"("familyId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_people_fatherId" ON "people"("fatherId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_people_motherId" ON "people"("motherId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_cross_family_personId" ON "cross_family_links"("personId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_family_members_userId" ON "family_members"("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_userId" ON "notifications"("userId")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "site_config"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gotra_config"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "approval_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cross_family_links"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "people"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "family_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "families"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
