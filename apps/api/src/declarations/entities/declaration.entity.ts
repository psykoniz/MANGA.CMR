import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeclarationEvent } from './declaration-event.entity';

export enum DeclarantType {
  CITIZEN = 'CITIZEN',
  MANDATAIRE = 'MANDATAIRE',
  NOTAIRE = 'NOTAIRE',
  PROFESSIONNEL = 'PROFESSIONNEL',
}

export enum DeclarationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  IN_REVIEW = 'IN_REVIEW',
  AUTO_APPROVED = 'AUTO_APPROVED',
  VALIDATED = 'VALIDATED',
  INCOMPLETE = 'INCOMPLETE',
  ATTESTATION_ISSUED = 'ATTESTATION_ISSUED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('declarations')
export class Declaration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  reference!: string;

  @Column({ type: 'enum', enum: DeclarantType })
  declarantType!: DeclarantType;

  @Column({ type: 'uuid', nullable: true })
  declarantUserId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  bienId!: string | null;

  @Column({
    type: 'enum',
    enum: DeclarationStatus,
    default: DeclarationStatus.DRAFT,
  })
  status!: DeclarationStatus;

  @Column({ type: 'int', nullable: true })
  scoreConfiance!: number | null;

  @Column({ type: 'decimal', nullable: true })
  montantDeclare!: number | null;

  @Column({ type: 'text', nullable: true })
  notesInstructeur!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => DeclarationEvent, (event) => event.declaration)
  events!: DeclarationEvent[];
}
