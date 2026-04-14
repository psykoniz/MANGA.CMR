import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { RuleAction } from './rule.entity';

@Entity('rule_evaluations')
export class RuleEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'declaration_id', type: 'uuid' })
  declarationId: string;

  @Column({ name: 'rule_id', type: 'uuid', nullable: true })
  ruleId: string | null;

  @Column({ name: 'rule_name', type: 'varchar', nullable: true })
  ruleName: string | null;

  @Column({ type: 'boolean' })
  matched: boolean;

  @Column({ type: 'enum', enum: RuleAction, nullable: true })
  actionTaken: RuleAction | null;

  @Column({ type: 'jsonb', nullable: true })
  inputData: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
