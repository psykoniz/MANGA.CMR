-- Demo/Test Data for PREDEM MVP
-- This data is used for client presentations and testing

BEGIN;

-- Create test users
-- Password hashes are bcrypt hashes of 'Test123!' (rounds: 12)
-- Declarant user: password = Test123!
INSERT INTO users (email, password_hash, role, is_active, is_email_verified, fullname, phone)
VALUES (
  'declarant@test.cm',
  '$2b$12$NgFWdppfKJv.Z5JZSLn2H.eW3X9EqWzLVaY.L5h8GKJJwLjKy2uOe',
  'DECLARANT',
  true,
  true,
  'Jean Nkomo',
  '+237123456789'
);

-- Instructeur user: password = Test123!
INSERT INTO users (email, password_hash, role, is_active, is_email_verified, fullname, phone)
VALUES (
  'instructeur@test.cm',
  '$2b$12$NgFWdppfKJv.Z5JZSLn2H.eW3X9EqWzLVaY.L5h8GKJJwLjKy2uOe',
  'INSTRUCTEUR',
  true,
  true,
  'Marie Eboga',
  '+237987654321'
);

-- Admin user: password = Test123!
INSERT INTO users (email, password_hash, role, is_active, is_email_verified, fullname, phone)
VALUES (
  'admin@test.cm',
  '$2b$12$NgFWdppfKJv.Z5JZSLn2H.eW3X9EqWzLVaY.L5h8GKJJwLjKy2uOe',
  'ADMIN_METIER',
  true,
  true,
  'Pierre Admin',
  '+237999999999'
);

-- Get user IDs for declarations
WITH declarant AS (
  SELECT id FROM users WHERE email = 'declarant@test.cm'
)
-- Create sample declarations
INSERT INTO declarations (reference, declarant_user_id, declarant_type, montant_declare, status)
SELECT
  'DEC-DOUALA-20260414-00001',
  declarant.id,
  'PERSONNE_PHYSIQUE',
  50000000,
  'DRAFT'
FROM declarant;

-- Add more declarations with different statuses
WITH declarant AS (
  SELECT id FROM users WHERE email = 'declarant@test.cm'
)
INSERT INTO declarations (reference, declarant_user_id, declarant_type, montant_declare, status, submitted_at)
SELECT
  'DEC-DOUALA-20260413-00002',
  declarant.id,
  'PERSONNE_MORALE',
  150000000,
  'SUBMITTED',
  NOW() - INTERVAL '1 day'
FROM declarant;

WITH declarant AS (
  SELECT id FROM users WHERE email = 'declarant@test.cm'
)
INSERT INTO declarations (reference, declarant_user_id, declarant_type, montant_declare, status, submitted_at)
SELECT
  'DEC-DOUALA-20260410-00003',
  declarant.id,
  'PERSONNE_PHYSIQUE',
  75000000,
  'IN_REVIEW',
  NOW() - INTERVAL '4 days'
FROM declarant;

-- Create sample biens (properties)
INSERT INTO biens (reference, designation, surface_cadastrale, code_lot, arrondissement, quartier, adresse, location)
VALUES (
  'BIEN-DOUALA-20260414-00001',
  'Terrain - Akwa Quarter',
  2500,
  'F123456',
  'Centre',
  'Akwa',
  'Rue Nationale, Akwa, Douala',
  ST_GeomFromText('POINT(9.7375 4.0305)', 4326)
);

INSERT INTO biens (reference, designation, surface_cadastrale, code_lot, arrondissement, quartier, adresse, location)
VALUES (
  'BIEN-DOUALA-20260413-00002',
  'Parcelle - Bonamoussadi',
  1800,
  'G654321',
  'Logpom',
  'Bonamoussadi',
  'Avenue Principale, Bonamoussadi',
  ST_GeomFromText('POINT(9.7675 3.9825)', 4326)
);

-- Create sample rules
INSERT INTO rules (name, description, condition_json, action, priority, is_active)
VALUES (
  'Auto-approve high confidence OCR',
  'Auto-approve if OCR score >= 90%',
  '{"field": "ocrScoreGlobal", "operator": ">=", "value": 90}',
  'AUTO_APPROVE',
  10,
  true
);

INSERT INTO rules (name, description, condition_json, action, priority, is_active)
VALUES (
  'Flag fraud for low OCR scores',
  'Flag for manual review if OCR score < 40%',
  '{"field": "ocrScoreGlobal", "operator": "<", "value": 40}',
  'FLAG_FRAUD',
  20,
  true
);

INSERT INTO rules (name, description, condition_json, action, priority, is_active)
VALUES (
  'Escalate high-value declarations',
  'Escalate for higher authority review if montant >= 100M XAF',
  '{"field": "montantDeclare", "operator": ">=", "value": 100000000}',
  'ESCALATE',
  30,
  true
);

INSERT INTO rules (name, description, condition_json, action, priority, is_active)
VALUES (
  'Default needs review',
  'Default: needs review for standard cases',
  '{"field": "ocrScoreGlobal", "operator": ">=", "value": 50}',
  'NEEDS_REVIEW',
  100,
  true
);

COMMIT;
