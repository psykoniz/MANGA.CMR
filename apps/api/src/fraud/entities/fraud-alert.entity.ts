import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('fraud_alerts')
export class FraudAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'declaration_id', type: 'uuid' })
  declarationId: string;

  @Column({ name: 'alert_type', type: 'varchar' })
  alertType: string;

  @Column({ type: 'varchar', default: 'MEDIUM' })
  severity: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @Column({ type: 'varchar', default: 'OPEN' })
  status: string;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolution_note', type: 'text', nullable: true })
  resolutionNote: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
