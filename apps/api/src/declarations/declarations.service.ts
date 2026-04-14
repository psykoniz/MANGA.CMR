import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  Declaration,
  DeclarationStatus,
} from './entities/declaration.entity';
import { DeclarationEvent } from './entities/declaration-event.entity';
import {
  CreateDeclarationDto,
  ReviewDeclarationDto,
  UpdateDeclarationDto,
} from './dto/declaration.dto';
import { generateReference } from '../common/utils/reference-generator';
import { REFERENCE_PREFIXES, INSTRUCTEUR_ROLES } from '../common/constants';

@Injectable()
export class DeclarationsService {
  private readonly logger = new Logger(DeclarationsService.name);

  constructor(
    @InjectRepository(Declaration)
    private declarationRepo: Repository<Declaration>,
    @InjectRepository(DeclarationEvent)
    private eventRepo: Repository<DeclarationEvent>,
    @InjectQueue('declaration-processing')
    private processingQueue: Queue,
  ) {}

  private generateReference(): string {
    return generateReference(REFERENCE_PREFIXES.DECLARATION);
  }

  async create(dto: CreateDeclarationDto, userId: string): Promise<Declaration> {
    try {
      const declaration = this.declarationRepo.create({
        reference: this.generateReference(),
        declarantType: dto.declarantType,
        declarantUserId: userId,
        montantDeclare: dto.montantDeclare ?? null,
        status: DeclarationStatus.DRAFT,
      });
      const saved = await this.declarationRepo.save(declaration);
      await this.appendEvent(
        saved.id,
        null,
        DeclarationStatus.DRAFT,
        userId,
        undefined,
        'Dossier créé',
      );
      this.logger.log(
        JSON.stringify({
          action: 'DECLARATION_CREATED',
          declarationId: saved.id,
          userId,
          timestamp: new Date().toISOString(),
        }),
      );
      return saved;
    } catch (error) {
      this.logger.error('Erreur création déclaration', { error });
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateDeclarationDto,
    userId: string,
  ): Promise<Declaration> {
    const declaration = await this.findByIdInternal(id);
    this.assertOwner(declaration, userId);
    this.validateStatus(declaration, DeclarationStatus.DRAFT, 'Seuls les dossiers en brouillon peuvent être modifiés');
    Object.assign(declaration, dto);
    return this.declarationRepo.save(declaration);
  }

  async submit(id: string, userId: string): Promise<Declaration> {
    const declaration = await this.findByIdInternal(id);
    this.assertOwner(declaration, userId);
    this.validateStatus(declaration, DeclarationStatus.DRAFT, 'Le dossier doit être en brouillon pour être soumis');
    declaration.status = DeclarationStatus.PENDING_PAYMENT;
    const saved = await this.declarationRepo.save(declaration);
    await this.appendEvent(
      id,
      DeclarationStatus.DRAFT,
      DeclarationStatus.PENDING_PAYMENT,
      userId,
      undefined,
      'En attente de paiement',
    );
    return saved;
  }

  async sign(
    id: string,
    otpCode: string,
    userId: string,
  ): Promise<Declaration> {
    const declaration = await this.findByIdInternal(id);
    this.assertOwner(declaration, userId);
    // OTP validation stub - in production validate via Redis stored OTP
    if (otpCode.length !== 6) {
      throw new BadRequestException('Code OTP invalide');
    }
    declaration.status = DeclarationStatus.SUBMITTED;
    declaration.submittedAt = new Date();
    const saved = await this.declarationRepo.save(declaration);
    await this.appendEvent(
      id,
      DeclarationStatus.PENDING_PAYMENT,
      DeclarationStatus.SUBMITTED,
      userId,
      undefined,
      'Dossier soumis et signé',
    );
    await this.processingQueue.add(
      'evaluate',
      { declarationId: id },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    this.logger.log(
      JSON.stringify({
        action: 'DECLARATION_SUBMITTED',
        declarationId: id,
        userId,
        timestamp: new Date().toISOString(),
      }),
    );
    return saved;
  }

  async getById(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<Declaration> {
    const declaration = await this.declarationRepo.findOne({
      where: { id },
      relations: ['events'],
    });
    if (!declaration) throw new NotFoundException('Dossier introuvable');
    if (
      !(INSTRUCTEUR_ROLES as readonly string[]).includes(userRole) &&
      declaration.declarantUserId !== userId
    ) {
      throw new ForbiddenException('Accès refusé');
    }
    return declaration;
  }

  async getTimeline(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<DeclarationEvent[]> {
    await this.getById(id, userId, userRole);
    return this.eventRepo.find({
      where: { declarationId: id },
      order: { createdAt: 'ASC' },
    });
  }

  async list(
    filters: { status?: string; page?: number; limit?: number },
    userRole: string,
    userId: string,
  ): Promise<{ data: Declaration[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const qb = this.declarationRepo.createQueryBuilder('d');
    if (!(INSTRUCTEUR_ROLES as readonly string[]).includes(userRole)) {
      qb.where('d.declarant_user_id = :userId', { userId });
    }
    if (filters.status) {
      qb.andWhere('d.status = :status', { status: filters.status });
    }
    qb.orderBy('d.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async review(
    id: string,
    dto: ReviewDeclarationDto,
    instructeurId: string,
  ): Promise<Declaration> {
    const declaration = await this.findByIdInternal(id);
    if (declaration.status !== DeclarationStatus.IN_REVIEW) {
      throw new BadRequestException(
        'Le dossier doit être en instruction pour être traité',
      );
    }
    const newStatus =
      dto.decision === 'VALIDATE'
        ? DeclarationStatus.VALIDATED
        : dto.decision === 'REJECT'
          ? DeclarationStatus.REJECTED
          : DeclarationStatus.INCOMPLETE;
    if (dto.notesInstructeur) {
      declaration.notesInstructeur = dto.notesInstructeur;
    }
    declaration.status = newStatus;
    const saved = await this.declarationRepo.save(declaration);
    await this.appendEvent(
      id,
      DeclarationStatus.IN_REVIEW,
      newStatus,
      instructeurId,
      undefined,
      dto.comment,
    );
    this.logger.log(
      JSON.stringify({
        action: 'DECLARATION_REVIEWED',
        declarationId: id,
        decision: dto.decision,
        instructeurId,
        timestamp: new Date().toISOString(),
      }),
    );
    return saved;
  }

  private async findByIdInternal(id: string): Promise<Declaration> {
    const d = await this.declarationRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Dossier introuvable');
    return d;
  }

  private assertOwner(
    declaration: Declaration,
    userId: string,
  ): void {
    if (declaration.declarantUserId !== userId) {
      throw new ForbiddenException(
        "Accès refusé : vous n'êtes pas le déclarant",
      );
    }
  }

  private validateStatus(declaration: Declaration, expectedStatus: DeclarationStatus, errorMessage: string): void {
    if (declaration.status !== expectedStatus) {
      throw new BadRequestException(errorMessage);
    }
  }

  private async appendEvent(
    declarationId: string,
    fromStatus: DeclarationStatus | null,
    toStatus: DeclarationStatus,
    triggeredBy: string | null,
    ruleApplied?: string,
    comment?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const event = this.eventRepo.create({
        declarationId,
        fromStatus: fromStatus ?? undefined,
        toStatus,
        triggeredBy,
        ruleApplied,
        comment,
        metadata,
      });
      await this.eventRepo.save(event);
    } catch (error) {
      this.logger.error('Erreur journalisation événement déclaration', {
        error,
      });
    }
  }
}
