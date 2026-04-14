import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Declaration } from '../entities/declaration.entity';

@Injectable()
export class SlaMonitorService {
  private readonly logger = new Logger(SlaMonitorService.name);

  constructor(
    @InjectRepository(Declaration)
    private declarationRepository: Repository<Declaration>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkSlaViolations(): Promise<void> {
    try {
      const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const violations = await this.declarationRepository.find({
        where: [
          { status: 'SUBMITTED' as any, submittedAt: LessThan(threshold) },
          { status: 'IN_REVIEW' as any, submittedAt: LessThan(threshold) },
        ],
      });

      for (const declaration of violations) {
        const hoursElapsed = declaration.submittedAt
          ? (Date.now() - declaration.submittedAt.getTime()) / (1000 * 60 * 60)
          : 0;
        this.logger.warn(
          JSON.stringify({
            action: 'SLA_VIOLATION_DETECTED',
            declarationId: declaration.id,
            reference: declaration.reference,
            hoursElapsed: Math.round(hoursElapsed * 10) / 10,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    } catch (error) {
      this.logger.error('Erreur vérification SLA', { error });
    }
  }
}
