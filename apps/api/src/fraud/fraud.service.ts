import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudAlert } from './entities/fraud-alert.entity';

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);

  constructor(
    @InjectRepository(FraudAlert)
    private fraudAlertRepo: Repository<FraudAlert>,
  ) {}

  async createAlert(
    declarationId: string,
    alertType: string,
    severity: string,
    details: Record<string, unknown>,
  ): Promise<void> {
    try {
      const alert = this.fraudAlertRepo.create({
        declarationId,
        alertType,
        severity,
        details,
        status: 'OPEN',
      });
      await this.fraudAlertRepo.save(alert);
      this.logger.warn(
        JSON.stringify({
          action: 'FRAUD_ALERT_CREATED',
          declarationId,
          alertType,
          severity,
        }),
      );
    } catch (error) {
      this.logger.error('Erreur création alerte fraude', { error });
    }
  }

  async getAlerts(status?: string): Promise<FraudAlert[]> {
    const query = this.fraudAlertRepo.createQueryBuilder('f');
    if (status) {
      query.where('f.status = :status', { status });
    }
    return query.orderBy('f.created_at', 'DESC').getMany();
  }

  async resolveAlert(
    id: string,
    resolution: string,
    note: string,
    userId: string,
  ): Promise<FraudAlert> {
    const alert = await this.fraudAlertRepo.findOne({ where: { id } });
    if (alert) {
      alert.status = resolution === 'RESOLVED' ? 'RESOLVED' : 'FALSE_POSITIVE';
      alert.resolvedBy = userId;
      alert.resolvedAt = new Date();
      alert.resolutionNote = note;
      return this.fraudAlertRepo.save(alert);
    }
    throw new Error(`FraudAlert ${id} not found`);
  }
}
