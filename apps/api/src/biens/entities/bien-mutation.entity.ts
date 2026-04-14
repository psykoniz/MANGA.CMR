import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bien } from './bien.entity';

@Entity('bien_mutations')
export class BienMutation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'bien_id' })
  bienId!: string;

  @Column({ type: 'uuid', nullable: true, name: 'declaration_id' })
  declarationId!: string | null;

  @Column({ type: 'varchar', name: 'type_mutation' })
  typeMutation!: string;

  @Column({
    type: 'timestamptz',
    name: 'date_mutation',
    default: () => 'NOW()',
  })
  dateMutation!: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'metadata_json' })
  metadataJson!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Bien, (bien) => bien.mutations)
  @JoinColumn({ name: 'bien_id' })
  bien!: Bien;
}
