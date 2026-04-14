/**
 * PREDEM Application Constants
 * Centralized configuration to avoid magic numbers and duplicated hardcoded values
 */

export const REFERENCE_PREFIXES = {
  DECLARATION: 'DEC-DOUALA',
  ATTESTATION: 'ATT-DOUALA',
  BIEN: 'BIEN-DOUALA',
} as const;

export const DOCUMENT_CONFIG = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  SIGNED_URL_EXPIRES_SECONDS: 900, // 15 minutes
  ACCEPTED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const PAYMENTS_CONFIG = {
  FRAIS_DOSSIER_DEFAUT_XAF: 5000,
  SEUIL_ESCALADE_MONTANT_XAF: 50000000,
} as const;

export const SLA_CONFIG = {
  DECLARATION_SLA_HOURS: 48,
} as const;

export const ATTESTATION_CONFIG = {
  VALIDITY_DAYS: 90,
  AUTHORITY_NAME: 'Ville de Douala',
} as const;

export const INSTRUCTEUR_ROLES = [
  'INSTRUCTEUR',
  'SUPERVISEUR',
  'SIGNATAIRE',
  'ADMIN_METIER',
  'ADMIN_TECHNIQUE',
] as const;

export const PHONE_PREFIXES = {
  MTN: ['650', '651', '652', '653', '654', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684', '685'],
  ORANGE: ['655', '656', '690', '691', '692', '693', '694', '695', '696', '697', '698', '699'],
} as const;
