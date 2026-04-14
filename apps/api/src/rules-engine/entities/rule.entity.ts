import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RuleType {
  VALIDATION = 'VALIDATION',
  ROUTING = 'ROUTING',
  EXPIRY = 'EXPIRY',
  FRAUD = 'FRAUD',
}

export enum RuleAction {
  AUTO_APPROVE = 'AUTO_APPROVE',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  REJECT = 'REJECT',
  ESCALATE = 'ESCALATE',
  FLAG_FRAUD = 'FLAG_FRAUD',
}

@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: RuleType })
  type: RuleType;

  @Column({ type: 'jsonb' })
  conditionJson: Record<string, unknown>;

  @Column({ type: 'enum', enum: RuleAction })
  action: RuleAction;

  @Column({ type: 'text', nullable: true })
  rejectionMessage: string | null;

  @Column({ type: 'int', default: 100 })
  priority: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
