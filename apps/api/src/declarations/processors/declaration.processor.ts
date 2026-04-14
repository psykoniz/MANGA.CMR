import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  Declaration,
  DeclarationStatus,
} from '../entities/declaration.entity';
import { DeclarationEvent } from '../entities/declaration-event.entity';

@Injectable()
@Processor('declaration-processing')
export class DeclarationProcessor {
  private readonly logger = new Logger(DeclarationProcessor.name);

  constructor(
    @InjectRepository(Declaration)
    private declarationRepo: Repository<Declaration>,
    @InjectRepository(DeclarationEvent)
    private eventRepo: Repository<DeclarationEvent>,
  ) {}

  @Process('evaluate')
  async handleEvaluate(job: Job<{ declarationId: string }>): Promise<void> {
    const { declarationId } = job.data;
    this.logger.log(
      JSON.stringify({
        action: 'PROCESSING_START',
        declarationId,
        timestamp: new Date().toISOString(),
      }),
    );
    try {
      const declaration = await this.declarationRepo.findOne({
        where: { id: declarationId },
      });
      if (!declaration) {
        this.logger.warn(`Déclaration ${declarationId} introuvable`);
        return;
      }
      // Stub: in production call DocumentsService, GeoService, RulesEngineService
      // For MVP: simple heuristic based on score
      const scoreConfiance = declaration.scoreConfiance ?? 60;
      const newStatus =
        scoreConfiance >= 70
          ? DeclarationStatus.AUTO_APPROVED
          : DeclarationStatus.IN_REVIEW;
      await this.declarationRepo.update(declarationId, { status: newStatus });
      const event = this.eventRepo.create({
        declarationId,
        fromStatus: DeclarationStatus.SUBMITTED,
        toStatus: newStatus,
        triggeredBy: null,
        ruleApplied: 'MOTEUR_REGLES_AUTO',
        comment:
          newStatus === DeclarationStatus.AUTO_APPROVED
            ? 'Approuvé automatiquement'
            : 'Envoyé en instruction',
      });
      await this.eventRepo.save(event);
      this.logger.log(
        JSON.stringify({
          action: 'PROCESSING_COMPLETE',
          declarationId,
          result: newStatus,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          action: 'PROCESSING_ERROR',
          declarationId,
          error: String(error),
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
