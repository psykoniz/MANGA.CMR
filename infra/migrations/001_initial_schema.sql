-- PREDEM / SmartFoncier Africa - Initial Database Schema
-- Database: predem_db
-- PostgreSQL 15 + PostGIS

BEGIN;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'DECLARANT',
  'INSTRUCTEUR',
  'SUPERVISEUR',
  'SIGNATAIRE',
  'ADMIN_METIER',
  'ADMIN_TECHNIQUE'
);

CREATE TYPE declaration_status AS ENUM (
  'DRAFT',
  'PENDING_PAYMENT',
  'SUBMITTED',
  'IN_REVIEW',
  'VALIDATED',
  'REJECTED',
  'INCOMPLETE',
  'ATTESTATION_ISSUED'
);

CREATE TYPE document_type AS ENUM (
  'IDENTITY_PROOF',
  'PROPERTY_DEED',
  'SURVEY_PLAN',
  'BIRTH_CERTIFICATE',
  'MARRIAGE_CERTIFICATE',
  'POWER_OF_ATTORNEY'
);

CREATE TYPE ocr_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'DONE',
  'FAILED',
  'NEEDS_REVIEW'
);

CREATE TYPE payment_provider AS ENUM (
  'MTN',
  'ORANGE'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'SUCCESS',
  'FAILED',
  'CANCELLED'
);

CREATE TYPE rule_action AS ENUM (
  'AUTO_APPROVE',
  'NEEDS_REVIEW',
  'REJECT',
  'FLAG_FRAUD',
  'ESCALATE'
);

CREATE TYPE fraud_alert_type AS ENUM (
  'DUPLICATE_DOC',
  'DUPLICATE_TF',
  'IDENTITY_MISMATCH',
  'PROPERTY_CONFLICT',
  'SUSPICIOUS_PATTERN'
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'DECLARANT',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  phone VARCHAR(20),
  fullname VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- DECLARATIONS TABLE
-- ============================================================================

CREATE TABLE declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(50) UNIQUE NOT NULL,
  declarant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  declarant_type VARCHAR(50),
  montant_declare DECIMAL(15, 2),
  status declaration_status NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMP WITH TIME ZONE,
  notes_instructeur TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_declarations_declarant ON declarations(declarant_user_id);
CREATE INDEX idx_declarations_status ON declarations(status);
CREATE INDEX idx_declarations_reference ON declarations(reference);
CREATE INDEX idx_declarations_created_at ON declarations(created_at DESC);

-- ============================================================================
-- DECLARATION EVENTS (Audit Trail)
-- ============================================================================

CREATE TABLE declaration_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  declaration_id UUID NOT NULL REFERENCES declarations(id) ON DELETE CASCADE,
  from_status declaration_status,
  to_status declaration_status NOT NULL,
  triggered_by UUID REFERENCES users(id),
  rule_applied VARCHAR(255),
  comment TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_declaration_events_declaration_id ON declaration_events(declaration_id);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  declaration_id UUID NOT NULL REFERENCES declarations(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  filename_original VARCHAR(255) NOT NULL,
  minio_key VARCHAR(500) NOT NULL,
  sha256_checksum VARCHAR(64) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100),
  ocr_status ocr_status NOT NULL DEFAULT 'PENDING',
  ocr_score INTEGER,
  ocr_data JSONB,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_declaration_id ON documents(declaration_id);
CREATE INDEX idx_documents_ocr_status ON documents(ocr_status);
CREATE UNIQUE INDEX idx_documents_sha256 ON documents(sha256_checksum);

-- ============================================================================
-- BIENS (Properties) TABLE
-- ============================================================================

CREATE TABLE biens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(50) UNIQUE NOT NULL,
  designation VARCHAR(500),
  surface_cadastrale DECIMAL(10, 2),
  surface_batie DECIMAL(10, 2),
  code_lot VARCHAR(50),
  arrondissement VARCHAR(100),
  quartier VARCHAR(100),
  adresse TEXT,
  location GEOMETRY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_biens_reference ON biens(reference);
CREATE INDEX idx_biens_location ON biens USING GIST(location);

-- ============================================================================
-- BIEN MUTATIONS (Append-only mutation log)
-- ============================================================================

CREATE TABLE bien_mutations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bien_id UUID NOT NULL REFERENCES biens(id),
  declaration_id UUID REFERENCES declarations(id),
  mutation_type VARCHAR(50),
  old_value JSONB,
  new_value JSONB,
  mutated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bien_mutations_bien_id ON bien_mutations(bien_id);

-- ============================================================================
-- TRANSACTIONS (Payments)
-- ============================================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(50) UNIQUE NOT NULL,
  declaration_id UUID NOT NULL REFERENCES declarations(id),
  amount_xaf DECIMAL(15, 2) NOT NULL,
  frais_xaf DECIMAL(15, 2) NOT NULL,
  total_xaf DECIMAL(15, 2) NOT NULL,
  provider payment_provider NOT NULL,
  phone_number VARCHAR(20),
  status payment_status NOT NULL DEFAULT 'PENDING',
  transaction_id_external VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_declaration_id ON transactions(declaration_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference ON transactions(reference);

-- ============================================================================
-- ATTESTATIONS TABLE
-- ============================================================================

CREATE TABLE attestations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(50) UNIQUE NOT NULL,
  declaration_id UUID NOT NULL REFERENCES declarations(id),
  emis_le TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expire_le TIMESTAMP WITH TIME ZONE NOT NULL,
  control_code_hash VARCHAR(255) NOT NULL,
  minio_key VARCHAR(500),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES users(id),
  revocation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attestations_reference ON attestations(reference);
CREATE INDEX idx_attestations_declaration_id ON attestations(declaration_id);

-- ============================================================================
-- RULES TABLE (Rule Engine)
-- ============================================================================

CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  condition_json JSONB NOT NULL,
  action rule_action NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rules_active_priority ON rules(is_active, priority);

-- ============================================================================
-- RULE EVALUATIONS TABLE (Audit for rule engine)
-- ============================================================================

CREATE TABLE rule_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  declaration_id UUID NOT NULL REFERENCES declarations(id),
  rule_id UUID NOT NULL REFERENCES rules(id),
  rule_name VARCHAR(255),
  matched BOOLEAN NOT NULL,
  action_taken rule_action,
  input_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rule_evaluations_declaration_id ON rule_evaluations(declaration_id);
CREATE INDEX idx_rule_evaluations_matched ON rule_evaluations(matched);

-- ============================================================================
-- FRAUD ALERTS TABLE
-- ============================================================================

CREATE TABLE fraud_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  declaration_id UUID NOT NULL REFERENCES declarations(id),
  alert_type fraud_alert_type NOT NULL,
  severity VARCHAR(20),
  description TEXT,
  related_declaration_id UUID REFERENCES declarations(id),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fraud_alerts_declaration_id ON fraud_alerts(declaration_id);
CREATE INDEX idx_fraud_alerts_is_resolved ON fraud_alerts(is_resolved);

-- ============================================================================
-- PREEMPTION ZONES TABLE (Geo-boundaries)
-- ============================================================================

CREATE TABLE zones_preemption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE,
  geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
  preemption_authority VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zones_preemption_geom ON zones_preemption USING GIST(geom);
CREATE INDEX idx_zones_preemption_code ON zones_preemption(code);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  title VARCHAR(255),
  body TEXT,
  data JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

COMMIT;
