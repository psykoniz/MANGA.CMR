-- Douala Preemption Zones (PostGIS Geometries)
-- These are example zones for Douala central areas

BEGIN;

-- Zone 1: Downtown Douala (Central Business District)
INSERT INTO zones_preemption (name, description, code, geom, preemption_authority)
VALUES (
  'Zone Préemption - Centre-Ville',
  'Downtown Douala / Central Business District',
  'DOUALA_CBD',
  ST_GeomFromText('MULTIPOLYGON(((9.7412 4.0511, 9.7550 4.0511, 9.7550 4.0400, 9.7412 4.0400, 9.7412 4.0511)))', 4326),
  'Mairie de Douala'
);

-- Zone 2: Akwa (Commercial Quarter)
INSERT INTO zones_preemption (name, description, code, geom, preemption_authority)
VALUES (
  'Zone Préemption - Akwa',
  'Akwa Quarter - Historic commercial district',
  'DOUALA_AKWA',
  ST_GeomFromText('MULTIPOLYGON(((9.7300 4.0300, 9.7450 4.0300, 9.7450 4.0150, 9.7300 4.0150, 9.7300 4.0300)))', 4326),
  'Mairie de Douala'
);

-- Zone 3: Bonamoussadi (Residential)
INSERT INTO zones_preemption (name, description, code, geom, preemption_authority)
VALUES (
  'Zone Préemption - Bonamoussadi',
  'Bonamoussadi District - Residential zone',
  'DOUALA_BONAMOUSSADI',
  ST_GeomFromText('MULTIPOLYGON(((9.7600 3.9900, 9.7750 3.9900, 9.7750 3.9750, 9.7600 3.9750, 9.7600 3.9900)))', 4326),
  'Mairie de Douala'
);

-- Zone 4: Deido (Historical/Commercial)
INSERT INTO zones_preemption (name, description, code, geom, preemption_authority)
VALUES (
  'Zone Préemption - Deido',
  'Deido - Historical trading area with protected heritage',
  'DOUALA_DEIDO',
  ST_GeomFromText('MULTIPOLYGON(((9.7200 4.0600, 9.7350 4.0600, 9.7350 4.0450, 9.7200 4.0450, 9.7200 4.0600)))', 4326),
  'Mairie de Douala'
);

COMMIT;
