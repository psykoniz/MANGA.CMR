import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum PaymentProvider {
  MTN = 'MTN',
  ORANGE = 'ORANGE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('transactions')
@Unique(['declarationId', 'attemptNumber'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  declarationId!: string;

  @Column({ type: 'int', default: 1 })
  attemptNumber!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', default: 'XAF' })
  currency!: string;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider!: PaymentProvider;

  @Column({ type: 'varchar', nullable: false })
  phoneNumber!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  externalReference!: string | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ type: 'jsonb', nullable: true })
  webhookData!: Record<string, unknown> | null;

  @Column({ type: 'varchar', nullable: true })
  quittanceMinioKey!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt!: Date | null;
}
