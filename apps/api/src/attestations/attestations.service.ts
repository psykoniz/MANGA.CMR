import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Attestation } from './entities/attestation.entity';
import { generateReference } from '../common/utils/reference-generator';
import { REFERENCE_PREFIXES, ATTESTATION_CONFIG } from '../common/constants';

interface VerifyResponse {
  valid: boolean;
  type?: string;
  reference?: string;
  emisLe?: string;
  expireLe?: string;
  autorite?: string;
}

@Injectable()
export class AttestationsService {
  private readonly logger = new Logger(AttestationsService.name);

  constructor(
    @InjectRepository(Attestation)
    private attestationRepo: Repository<Attestation>,
  ) {}

  private generateReference(): string {
    return generateReference(REFERENCE_PREFIXES.ATTESTATION);
  }

  async verify(reference: string, codeControle: string): Promise<VerifyResponse> {
    try {
      const attestation = await this.attestationRepo.findOne({
        where: { reference },
      });

      if (!attestation) {
        return { valid: false };
      }

      if (attestation.revokedAt) {
        return { valid: false };
      }

      if (attestation.expireLe < new Date()) {
        return { valid: false };
      }

      const isMatch = await bcrypt.compare(codeControle, attestation.controlCodeHash);

      if (!isMatch) {
        return { valid: false };
      }

      return {
        valid: true,
        type: 'ATTESTATION_DE_RENONCIATION',
        reference: attestation.reference,
        emisLe: attestation.emisLe.toISOString(),
        expireLe: attestation.expireLe.toISOString(),
        autorite: ATTESTATION_CONFIG.AUTHORITY_NAME,
      };
    } catch (error) {
      this.logger.error('Erreur vérification attestation', { error });
      throw error;
    }
  }

  async getDownloadUrl(id: string): Promise<string> {
    const attestation = await this.attestationRepo.findOne({ where: { id } });
    if (!attestation) {
      throw new BadRequestException('Attestation introuvable');
    }
    // Stub: return MinIO signed URL
    return `https://minio.predem.douala.cm/predem-docs/${attestation.minioKey}`;
  }

  async revoke(id: string, reason: string, revokedBy: string): Promise<Attestation> {
    const attestation = await this.attestationRepo.findOne({ where: { id } });
    if (!attestation) {
      throw new BadRequestException('Attestation introuvable');
    }
    attestation.revokedAt = new Date();
    attestation.revokedBy = revokedBy;
    attestation.revocationReason = reason;
    this.logger.log(
      JSON.stringify({
        action: 'ATTESTATION_REVOKED',
        attestationId: id,
        revokedBy,
      }),
    );
    return this.attestationRepo.save(attestation);
  }
}
