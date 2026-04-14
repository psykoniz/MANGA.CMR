import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Bien } from './entities/bien.entity';
import { BienMutation } from './entities/bien-mutation.entity';

@Injectable()
export class BiensService {
  private readonly logger = new Logger(BiensService.name);

  constructor(
    @InjectRepository(Bien)
    private bienRepo: Repository<Bien>,
    @InjectRepository(BienMutation)
    private mutationRepo: Repository<BienMutation>,
    private entityManager: EntityManager,
  ) {}

  // ─── generateReference ─────────────────────────────────────────────────────

  private generateReference(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return `BIEN-DOUALA-${date}-${seq}`;
  }

  // ─── findOrCreate ──────────────────────────────────────────────────────────

  async findOrCreate(
    referenceFonciere: string | null,
    localisationText: string,
  ): Promise<Bien> {
    if (referenceFonciere) {
      const existing = await this.bienRepo.findOne({
        where: { referenceFonciere },
      });
      if (existing) {
        this.logger.log(
          JSON.stringify({
            action: 'BIEN_FOUND',
            bienId: existing.id,
            referenceFonciere,
            timestamp: new Date().toISOString(),
          }),
        );
        return existing;
      }
    }

    const bien = this.bienRepo.create({
      referenceUnique: this.generateReference(),
      referenceFonciere: referenceFonciere ?? null,
      localisationText,
    });
    const saved = await this.bienRepo.save(bien);
    this.logger.log(
      JSON.stringify({
        action: 'BIEN_CREATED',
        bienId: saved.id,
        referenceUnique: saved.referenceUnique,
        timestamp: new Date().toISOString(),
      }),
    );
    return saved;
  }

  // ─── updateGeometry ────────────────────────────────────────────────────────

  async updateGeometry(
    bienId: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    const bien = await this.bienRepo.findOne({ where: { id: bienId } });
    if (!bien) {
      throw new NotFoundException(`Bien ${bienId} introuvable`);
    }

    await this.entityManager.query(
      `UPDATE biens
       SET geometry = ST_SetSRID(ST_MakePoint($1, $2), 4326)
       WHERE id = $3`,
      [lng, lat, bienId],
    );

    this.logger.log(
      JSON.stringify({
        action: 'BIEN_GEOMETRY_UPDATED',
        bienId,
        lat,
        lng,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  // ─── getHistory ────────────────────────────────────────────────────────────

  async getHistory(bienId: string): Promise<BienMutation[]> {
    const bien = await this.bienRepo.findOne({ where: { id: bienId } });
    if (!bien) {
      throw new NotFoundException(`Bien ${bienId} introuvable`);
    }

    return this.mutationRepo.find({
      where: { bienId },
      order: { dateMutation: 'DESC' },
    });
  }

  // ─── recordMutation ────────────────────────────────────────────────────────

  async recordMutation(
    bienId: string,
    declarationId: string | null,
    typeMutation: string,
    metadata?: Record<string, unknown>,
  ): Promise<BienMutation> {
    const mutation = this.mutationRepo.create({
      bienId,
      declarationId,
      typeMutation,
      metadataJson: metadata ?? null,
    });
    const saved = await this.mutationRepo.save(mutation);
    this.logger.log(
      JSON.stringify({
        action: 'BIEN_MUTATION_RECORDED',
        mutationId: saved.id,
        bienId,
        typeMutation,
        timestamp: new Date().toISOString(),
      }),
    );
    return saved;
  }

  // ─── findById ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Bien> {
    const bien = await this.bienRepo.findOne({
      where: { id },
      relations: ['mutations'],
    });
    if (!bien) {
      throw new NotFoundException(`Bien ${id} introuvable`);
    }
    return bien;
  }

  // ─── search ────────────────────────────────────────────────────────────────

  async search(params: {
    referenceFonciere?: string;
    quartier?: string;
    arrondissement?: string;
  }): Promise<Bien[]> {
    const qb = this.bienRepo.createQueryBuilder('b');

    if (params.referenceFonciere) {
      qb.andWhere('b.reference_fonciere ILIKE :ref', {
        ref: `%${params.referenceFonciere}%`,
      });
    }
    if (params.quartier) {
      qb.andWhere('b.quartier ILIKE :quartier', {
        quartier: `%${params.quartier}%`,
      });
    }
    if (params.arrondissement) {
      qb.andWhere('b.arrondissement ILIKE :arrondissement', {
        arrondissement: `%${params.arrondissement}%`,
      });
    }

    qb.orderBy('b.created_at', 'DESC').take(50);
    return qb.getMany();
  }
}
