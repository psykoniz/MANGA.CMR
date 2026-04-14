import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('attestations')
export class Attestation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  reference: string;

  @Column({ name: 'declaration_id', type: 'uuid' })
  declarationId: string;

  @Column({ name: 'minio_key', type: 'varchar' })
  minioKey: string;

  @Column({ name: 'pdf_hash', type: 'varchar', length: 64 })
  pdfHash: string;

  @Column({ name: 'control_code', type: 'varchar', length: 8 })
  controlCode: string;

  @Column({ name: 'control_code_hash', type: 'varchar', length: 255 })
  controlCodeHash: string;

  @Column({ name: 'emis_le', type: 'timestamptz', default: () => 'NOW()' })
  emisLe: Date;

  @Column({ name: 'expire_le', type: 'timestamptz' })
  expireLe: Date;

  @Column({ name: 'generated_by', type: 'uuid', nullable: true })
  generatedBy: string | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'revoked_by', type: 'uuid', nullable: true })
  revokedBy: string | null;

  @Column({ name: 'revocation_reason', type: 'text', nullable: true })
  revocationReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
