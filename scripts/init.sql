-- ============================================
-- VANSHA PLATFORM - POSTGRESQL SCHEMA
-- ============================================
-- Production-grade genealogical database schema
-- Supports RBAC, approvals, privacy, audit trails

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'elder', 'contributor', 'member', 'viewer');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE date_accuracy AS ENUM ('exact', 'approximate', 'estimated', 'unknown');
CREATE TYPE privacy_level AS ENUM ('private', 'family', 'invited', 'public');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'revoked');
CREATE TYPE event_type AS ENUM ('wedding', 'bratabandha', 'memorial', 'gathering');
CREATE TYPE notification_type AS ENUM ('approval_request', 'invitation', 'mention', 'milestone');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push');
CREATE TYPE action_type AS ENUM ('create', 'update', 'delete', 'approve', 'reject');

-- ============================================
-- TABLES
-- ============================================

-- Users (Clerk integration)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  profile_image_url TEXT,
  bio TEXT,
  notification_preferences JSONB DEFAULT '{
    "in_app": true,
    "email": false,
    "push": false,
    "approval_requests": true,
    "family_invitations": true,
    "mentions": true
  }'::JSONB,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Families (Family tree roots)
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  founder_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  profile_image_url TEXT,
  ancestral_village VARCHAR(255),
  ancestral_district VARCHAR(255),
  ancestral_province VARCHAR(255),
  metadata JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Family Members (RBAC)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'member',
  relationship_to_founder VARCHAR(255),
  is_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID REFERENCES users(id),
  permissions JSONB DEFAULT '{
    "edit_tree": false,
    "approve_changes": false,
    "invite_members": false,
    "upload_media": false,
    "manage_memorials": false,
    "view_living_data": true
  }'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_family_user UNIQUE(family_id, user_id)
);

-- People (Core genealogical data)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  last_name VARCHAR(255) NOT NULL,
  nepali_name VARCHAR(255),
  gender gender_type NOT NULL,
  birth_date DATE,
  birth_date_accuracy date_accuracy DEFAULT 'unknown',
  death_date DATE,
  death_date_accuracy date_accuracy DEFAULT 'unknown',
  is_living BOOLEAN DEFAULT true,
  photo_url TEXT,
  biography TEXT,
  caste VARCHAR(255),
  sub_caste VARCHAR(255),
  gotra VARCHAR(255),
  ancestral_village VARCHAR(255),
  ancestral_district VARCHAR(255),
  ancestral_province VARCHAR(255),
  ancestral_country VARCHAR(255) DEFAULT 'Nepal',
  father_id UUID REFERENCES people(id),
  mother_id UUID REFERENCES people(id),
  privacy_level privacy_level DEFAULT 'family',
  birth_visibility privacy_level DEFAULT 'family',
  death_visibility privacy_level DEFAULT 'family',
  relation_visibility privacy_level DEFAULT 'family',
  memorial_enabled BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT check_living_death CHECK (
    (is_living = true AND death_date IS NULL) OR
    (is_living = false AND death_date IS NOT NULL) OR
    (is_living = true AND death_date IS NOT NULL)  -- Allow edge case
  ),
  CONSTRAINT check_birth_death CHECK (
    birth_date IS NULL OR death_date IS NULL OR birth_date <= death_date
  )
);

-- Approval Requests (Ancestor edit workflow)
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES users(id) NOT NULL,
  approved_by UUID REFERENCES users(id),
  requested_changes JSONB NOT NULL,
  current_values JSONB NOT NULL,
  status approval_status DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Media Uploads (Photos and documents)
CREATE TABLE media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER CHECK (file_size > 0),
  mime_type VARCHAR(100),
  r2_key VARCHAR(500),
  description TEXT,
  is_profile_photo BOOLEAN DEFAULT false,
  privacy_level privacy_level DEFAULT 'family',
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Invitations (Family member invitations)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  invited_email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES users(id) NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  role user_role DEFAULT 'member',
  is_accepted BOOLEAN DEFAULT false,
  accepted_by UUID REFERENCES users(id),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_invitation_email CHECK (invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  related_id UUID,
  related_type VARCHAR(50),
  data JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  channels notification_channel[] DEFAULT ARRAY['in_app'::notification_channel],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events (Weddings, ceremonies, gatherings)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  organizer_id UUID REFERENCES users(id) NOT NULL,
  is_published BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Event Invitations
CREATE TABLE event_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  invited_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  rsvp_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_event_user UNIQUE(event_id, invited_user_id)
);

-- OCR Imports (Draft trees from Vanshavali books)
CREATE TABLE ocr_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  extracted_people JSONB,
  extracted_relationships JSONB,
  confidence_score NUMERIC(5,2),
  status VARCHAR(50) DEFAULT 'pending_review',
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  is_merged BOOLEAN DEFAULT false,
  merged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs (Immutable action trail)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action action_type NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID NOT NULL,
  family_id UUID REFERENCES families(id),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Search Index Metadata (Meilisearch sync)
CREATE TABLE search_index_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID NOT NULL,
  index_name VARCHAR(255) NOT NULL,
  is_indexed BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_resource_index UNIQUE(resource_type, resource_id, index_name)
);

-- ============================================
-- INDEXES (Performance)
-- ============================================

-- Users
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Families
CREATE INDEX idx_families_founder_id ON families(founder_id);
CREATE INDEX idx_families_is_active ON families(is_active);
CREATE INDEX idx_families_deleted_at ON families(deleted_at);

-- Family Members
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_role ON family_members(role);
CREATE INDEX idx_family_members_is_approved ON family_members(is_approved);

-- People
CREATE INDEX idx_people_family_id ON people(family_id);
CREATE INDEX idx_people_full_name ON people(first_name, last_name);
CREATE INDEX idx_people_father_id ON people(father_id);
CREATE INDEX idx_people_mother_id ON people(mother_id);
CREATE INDEX idx_people_gotra ON people(gotra);
CREATE INDEX idx_people_caste ON people(caste);
CREATE INDEX idx_people_is_living ON people(is_living);
CREATE INDEX idx_people_birth_date ON people(birth_date);
CREATE INDEX idx_people_death_date ON people(death_date);
CREATE INDEX idx_people_ancestral_village ON people(ancestral_village);
CREATE INDEX idx_people_ancestral_district ON people(ancestral_district);
CREATE INDEX idx_people_deleted_at ON people(deleted_at);

-- Approval Requests
CREATE INDEX idx_approval_requests_family_id ON approval_requests(family_id);
CREATE INDEX idx_approval_requests_person_id ON approval_requests(person_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_expires_at ON approval_requests(expires_at);

-- Media Uploads
CREATE INDEX idx_media_uploads_family_id ON media_uploads(family_id);
CREATE INDEX idx_media_uploads_person_id ON media_uploads(person_id);
CREATE INDEX idx_media_uploads_uploaded_by ON media_uploads(uploaded_by);
CREATE INDEX idx_media_uploads_deleted_at ON media_uploads(deleted_at);

-- Invitations
CREATE INDEX idx_invitations_family_id ON invitations(family_id);
CREATE INDEX idx_invitations_invited_email ON invitations(invited_email);
CREATE INDEX idx_invitations_is_accepted ON invitations(is_accepted);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Events
CREATE INDEX idx_events_family_id ON events(family_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_deleted_at ON events(deleted_at);

-- OCR Imports
CREATE INDEX idx_ocr_imports_family_id ON ocr_imports(family_id);
CREATE INDEX idx_ocr_imports_status ON ocr_imports(status);
CREATE INDEX idx_ocr_imports_is_merged ON ocr_imports(is_merged);

-- Audit Logs
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_family_id ON audit_logs(family_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Search Index Metadata
CREATE INDEX idx_search_index_metadata_resource ON search_index_metadata(resource_type, resource_id);
CREATE INDEX idx_search_index_metadata_last_synced ON search_index_metadata(last_synced_at);

-- ============================================
-- TRIGGERS (Automatic timestamp management)
-- ============================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_family_members_updated_at BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_approval_requests_updated_at BEFORE UPDATE ON approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_media_uploads_updated_at BEFORE UPDATE ON media_uploads
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_ocr_imports_updated_at BEFORE UPDATE ON ocr_imports
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_search_index_metadata_updated_at BEFORE UPDATE ON search_index_metadata
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- VIEWS (Common queries)
-- ============================================

-- Active family members (approved)
CREATE OR REPLACE VIEW active_family_members AS
SELECT fm.*, u.email, u.first_name, u.last_name
FROM family_members fm
JOIN users u ON fm.user_id = u.id
WHERE fm.is_approved = true
  AND u.deleted_at IS NULL;

-- Living people per family
CREATE OR REPLACE VIEW living_people_per_family AS
SELECT family_id, COUNT(*) as living_count
FROM people
WHERE is_living = true AND deleted_at IS NULL
GROUP BY family_id;

-- Pending approvals
CREATE OR REPLACE VIEW pending_approvals AS
SELECT ar.*, p.first_name, p.last_name, u.email
FROM approval_requests ar
JOIN people p ON ar.person_id = p.id
JOIN users u ON ar.requested_by = u.id
WHERE ar.status = 'pending'
  AND ar.expires_at > NOW();

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
  actor_id,
  COUNT(*) as total_actions,
  COUNT(CASE WHEN action = 'create' THEN 1 END) as creates,
  COUNT(CASE WHEN action = 'update' THEN 1 END) as updates,
  COUNT(CASE WHEN action = 'delete' THEN 1 END) as deletes,
  MAX(created_at) as last_action_at
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY actor_id;

-- ============================================
-- RBAC PERMISSION MATRIX
-- ============================================
-- Admin:        edit_tree ✓ approve ✓ invite ✓ upload ✓ memorials ✓
-- Elder:        edit_tree ✓ approve ✓ invite ✗ upload ✓ memorials ✓
-- Contributor:  edit_tree ✓ approve ✗ invite ✗ upload ✓ memorials ✗
-- Member:       edit_tree ✗ approve ✗ invite ✗ upload ✗ memorials ✗
-- Viewer:       (read-only)
