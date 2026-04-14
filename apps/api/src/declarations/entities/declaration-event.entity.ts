import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Declaration, DeclarationStatus } from './declaration.entity';

@Entity('declaration_events')
export class DeclarationEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  declarationId!: string;

  @Column({ type: 'enum', enum: DeclarationStatus, nullable: true })
  fromStatus!: DeclarationStatus | null;

  @Column({ type: 'enum', enum: DeclarationStatus })
  toStatus!: DeclarationStatus;

  @Column({ type: 'uuid', nullable: true })
  triggeredBy!: string | null;

  @Column({ type: 'varchar', nullable: true })
  ruleApplied!: string | null;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Declaration, (declaration) => declaration.events)
  @JoinColumn({ name: 'declarationId' })
  declaration!: Declaration;
}
