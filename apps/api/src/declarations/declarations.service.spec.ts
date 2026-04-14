import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeclarationsService } from './declarations.service';
import { Declaration, DeclarantType, DeclarationStatus } from './entities/declaration.entity';
import { DeclarationEvent } from './entities/declaration-event.entity';
import { CreateDeclarationDto, ReviewDeclarationDto, ReviewDecision } from './dto/declaration.dto';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockDeclarationRepo = (): MockRepository<Declaration> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
  update: jest.fn(),
});

const mockEventRepo = (): MockRepository<DeclarationEvent> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

const mockQueue = () => ({
  add: jest.fn(),
});

describe('DeclarationsService', () => {
  let service: DeclarationsService;
  let declarationRepo: MockRepository<Declaration>;
  let eventRepo: MockRepository<DeclarationEvent>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeclarationsService,
        {
          provide: getRepositoryToken(Declaration),
          useFactory: mockDeclarationRepo,
        },
        {
          provide: getRepositoryToken(DeclarationEvent),
          useFactory: mockEventRepo,
        },
        {
          provide: getQueueToken('declaration-processing'),
          useFactory: mockQueue,
        },
      ],
    }).compile();

    service = module.get<DeclarationsService>(DeclarationsService);
    declarationRepo = module.get<MockRepository<Declaration>>(
      getRepositoryToken(Declaration),
    );
    eventRepo = module.get<MockRepository<DeclarationEvent>>(
      getRepositoryToken(DeclarationEvent),
    );
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a declaration with DRAFT status', async () => {
      const userId = 'user-uuid-123';
      const dto: CreateDeclarationDto = {
        declarantType: DeclarantType.CITIZEN,
        montantDeclare: 500_000,
      };

      const builtDeclaration: Partial<Declaration> = {
        reference: 'DEC-DOUALA-20260414-00001',
        declarantType: DeclarantType.CITIZEN,
        declarantUserId: userId,
        montantDeclare: 500_000,
        status: DeclarationStatus.DRAFT,
      };

      const savedDeclaration: Declaration = {
        ...builtDeclaration,
        id: 'decl-uuid-abc',
        bienId: null,
        scoreConfiance: null,
        notesInstructeur: null,
        submittedAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        events: [],
      } as Declaration;

      declarationRepo.create!.mockReturnValue(builtDeclaration);
      declarationRepo.save!.mockResolvedValue(savedDeclaration);
      eventRepo.create!.mockReturnValue({});
      eventRepo.save!.mockResolvedValue({});

      const result = await service.create(dto, userId);

      expect(declarationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          declarantType: DeclarantType.CITIZEN,
          declarantUserId: userId,
          status: DeclarationStatus.DRAFT,
        }),
      );
      expect(declarationRepo.save).toHaveBeenCalledTimes(1);
      expect(result.status).toBe(DeclarationStatus.DRAFT);
      expect(result.id).toBe('decl-uuid-abc');
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should throw ForbiddenException when the requesting user is not the owner', async () => {
      const ownerUserId = 'owner-uuid-111';
      const otherUserId = 'other-uuid-999';

      const existingDeclaration: Partial<Declaration> = {
        id: 'decl-uuid-abc',
        declarantUserId: ownerUserId,
        status: DeclarationStatus.DRAFT,
      };

      declarationRepo.findOne!.mockResolvedValue(existingDeclaration);

      await expect(
        service.update('decl-uuid-abc', {}, otherUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when declaration is not in DRAFT status', async () => {
      const userId = 'user-uuid-123';

      const existingDeclaration: Partial<Declaration> = {
        id: 'decl-uuid-abc',
        declarantUserId: userId,
        status: DeclarationStatus.SUBMITTED,
      };

      declarationRepo.findOne!.mockResolvedValue(existingDeclaration);

      await expect(
        service.update('decl-uuid-abc', {}, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── review ─────────────────────────────────────────────────────────────────

  describe('review', () => {
    it('should throw BadRequestException when declaration status is not IN_REVIEW', async () => {
      const instructeurId = 'instructeur-uuid-456';

      const declaration: Partial<Declaration> = {
        id: 'decl-uuid-abc',
        declarantUserId: 'owner-uuid-111',
        status: DeclarationStatus.DRAFT,
      };

      declarationRepo.findOne!.mockResolvedValue(declaration);

      const dto: ReviewDeclarationDto = {
        decision: ReviewDecision.VALIDATE,
        comment: 'Dossier complet',
      };

      await expect(
        service.review('decl-uuid-abc', dto, instructeurId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return VALIDATED declaration when decision is VALIDATE', async () => {
      const instructeurId = 'instructeur-uuid-456';

      const declaration: Partial<Declaration> = {
        id: 'decl-uuid-abc',
        declarantUserId: 'owner-uuid-111',
        status: DeclarationStatus.IN_REVIEW,
        notesInstructeur: null,
      };

      const savedDeclaration = {
        ...declaration,
        status: DeclarationStatus.VALIDATED,
      } as Declaration;

      declarationRepo.findOne!.mockResolvedValue(declaration);
      declarationRepo.save!.mockResolvedValue(savedDeclaration);
      eventRepo.create!.mockReturnValue({});
      eventRepo.save!.mockResolvedValue({});

      const dto: ReviewDeclarationDto = {
        decision: ReviewDecision.VALIDATE,
        comment: 'Dossier complet et conforme',
      };

      const result = await service.review('decl-uuid-abc', dto, instructeurId);

      expect(result.status).toBe(DeclarationStatus.VALIDATED);
    });

    it('should throw NotFoundException when declaration does not exist', async () => {
      declarationRepo.findOne!.mockResolvedValue(null);

      const dto: ReviewDeclarationDto = {
        decision: ReviewDecision.REJECT,
        comment: 'Documents manquants',
      };

      await expect(
        service.review('non-existent-uuid', dto, 'instructeur-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
