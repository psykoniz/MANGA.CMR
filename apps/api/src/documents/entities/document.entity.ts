import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum DocumentType {
  CNI = 'CNI',
  PASSEPORT = 'PASSEPORT',
  TITRE_FONCIER = 'TITRE_FONCIER',
  CERT_PROPRIETE = 'CERT_PROPRIETE',
  PLAN_MASSE = 'PLAN_MASSE',
  PROCURATION = 'PROCURATION',
  ACTE_NOTARIE = 'ACTE_NOTARIE',
  AUTRE = 'AUTRE',
}

export enum OcrStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  declarationId!: string;

  @Column({ type: 'enum', enum: DocumentType })
  type!: DocumentType;

  @Column({ type: 'varchar', nullable: true })
  filenameOriginal!: string | null;

  @Column({ type: 'varchar', nullable: false })
  minioKey!: string;

  @Column({ type: 'varchar', length: 64, nullable: false })
  sha256Checksum!: string;

  @Column({ type: 'int', nullable: true })
  fileSizeBytes!: number | null;

  @Column({ type: 'varchar', nullable: true })
  mimeType!: string | null;

  @Column({ type: 'enum', enum: OcrStatus, default: OcrStatus.PENDING })
  ocrStatus!: OcrStatus;

  @Column({ type: 'int', nullable: true })
  ocrScore!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  ocrData!: Record<string, unknown> | null;

  @Column({ type: 'uuid', nullable: true })
  uploadedBy!: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  uploadedAt!: Date;
}
