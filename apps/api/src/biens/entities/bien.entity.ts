import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BienMutation } from './bien-mutation.entity';

@Entity('biens')
export class Bien {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true, name: 'reference_unique' })
  referenceUnique!: string;

  @Column({ type: 'varchar', nullable: true, name: 'reference_fonciere' })
  referenceFonciere!: string | null;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Geometry',
    srid: 4326,
    nullable: true,
  })
  geometry!: object | null;

  @Column({ type: 'decimal', nullable: true })
  superficie!: number | null;

  @Column({ type: 'text', nullable: true, name: 'localisation_text' })
  localisationText!: string | null;

  @Column({ type: 'varchar', nullable: true })
  quartier!: string | null;

  @Column({ type: 'varchar', nullable: true })
  arrondissement!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => BienMutation, (mutation) => mutation.bien)
  mutations!: BienMutation[];
}
