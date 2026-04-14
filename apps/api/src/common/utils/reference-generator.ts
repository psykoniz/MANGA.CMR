/**
 * Shared utility for generating unique reference numbers
 * Used by Declarations, Attestations, and Biens
 */

export function generateReference(prefix: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
  return `${prefix}-${date}-${seq}`;
}
