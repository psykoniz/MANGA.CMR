import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ZonePreemption } from './entities/zone-preemption.entity';
import { CreateZoneDto } from './dto/geo.dto';

interface PreemptionCheckResult {
  inZone: boolean;
  zoneName?: string;
  zoneType?: string;
  zoneId?: string;
}

interface ZoneRow {
  id: string;
  name: string;
  type: string;
}

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  constructor(
    @InjectRepository(ZonePreemption)
    private readonly zoneRepo: Repository<ZonePreemption>,
    private readonly entityManager: EntityManager,
  ) {}

  async checkPreemption(lat: number, lng: number): Promise<PreemptionCheckResult> {
    try {
      const results = await this.entityManager.query<ZoneRow[]>(
        `SELECT id, name, type FROM zones_preemption
         WHERE is_active = true
           AND ST_Contains(geometry, ST_SetSRID(ST_Point($1, $2), 4326))
         LIMIT 1`,
        [lng, lat],
      );

      if (results.length > 0) {
        return {
          inZone: true,
          zoneName: results[0].name,
          zoneType: results[0].type,
          zoneId: results[0].id,
        };
      }

      return { inZone: false };
    } catch (error) {
      this.logger.error('Erreur vérification zone préemption', { error });
      return { inZone: false };
    }
  }

  async getZones(): Promise<ZonePreemption[]> {
    return this.zoneRepo.find({ where: { isActive: true } });
  }

  async createZone(dto: CreateZoneDto, userId: string): Promise<ZonePreemption> {
    const zone = this.zoneRepo.create({
      name: dto.name,
      code: dto.code ?? null,
      type: dto.type,
      geometry: dto.geometry,
      description: dto.description ?? null,
      isActive: true,
      createdBy: userId,
    });

    const saved = await this.zoneRepo.save(zone);

    this.logger.log(
      JSON.stringify({
        action: 'ZONE_CREATED',
        zoneId: saved.id,
        name: saved.name,
        type: saved.type,
        userId,
      }),
    );

    return saved;
  }
}
