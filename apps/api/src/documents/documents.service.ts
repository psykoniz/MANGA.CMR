import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import { Document, DocumentType, OcrStatus } from './entities/document.entity';
import { MinioService } from './services/minio.service';
import { OcrService } from './services/ocr.service';
import { DOCUMENT_CONFIG, INSTRUCTEUR_ROLES } from '../common/constants';

export interface UploadResult {
  documentId: string;
  minioKey: string;
  sha256Checksum: string;
}

export interface SignedUrlResult {
  signedUrl: string;
  expiresAt: Date;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly minioService: MinioService,
    private readonly ocrService: OcrService,
    @InjectQueue('ocr-processing')
    private readonly ocrQueue: Queue,
  ) {}

  async upload(
    file: Express.Multer.File,
    declarationId: string,
    documentType: DocumentType,
    userId: string,
  ): Promise<UploadResult> {
    // Validate MIME type
    if (!(DOCUMENT_CONFIG.ACCEPTED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non supporté. Types acceptés : ${DOCUMENT_CONFIG.ACCEPTED_MIME_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > DOCUMENT_CONFIG.MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `Fichier trop volumineux. Taille maximale : ${DOCUMENT_CONFIG.MAX_FILE_SIZE_MB} Mo`,
      );
    }

    // Compute SHA-256 checksum
    const sha256Checksum = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    // Generate MinIO key
    const minioKey = this.minioService.generateKey(
      declarationId,
      documentType,
      file.originalname,
    );

    // Upload to MinIO
    await this.minioService.uploadFile(file.buffer, minioKey, file.mimetype);

    // Persist entity
    const document = this.documentRepository.create({
      declarationId,
      type: documentType,
      filenameOriginal: file.originalname,
      minioKey,
      sha256Checksum,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      ocrStatus: OcrStatus.PENDING,
      uploadedBy: userId,
    });

    const saved = await this.documentRepository.save(document);

    // Enqueue OCR job
    await this.ocrQueue.add(
      'process-ocr',
      { documentId: saved.id },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );

    this.logger.log(
      JSON.stringify({
        action: 'DOCUMENT_UPLOADED',
        documentId: saved.id,
        declarationId,
        documentType,
        userId,
      }),
    );

    return {
      documentId: saved.id,
      minioKey: saved.minioKey,
      sha256Checksum: saved.sha256Checksum,
    };
  }

  async getSignedUrl(
    documentId: string,
    userId: string,
    userRole: string,
  ): Promise<SignedUrlResult> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} introuvable`);
    }

    // Access control: owners and instructeurs can download
    if (document.uploadedBy !== userId && !(INSTRUCTEUR_ROLES as readonly string[]).includes(userRole)) {
      throw new ForbiddenException('Accès refusé à ce document');
    }

    const signedUrl = await this.minioService.getSignedUrl(document.minioKey);
    const expiresAt = new Date(Date.now() + DOCUMENT_CONFIG.SIGNED_URL_EXPIRES_SECONDS * 1000);

    return { signedUrl, expiresAt };
  }

  async getOcrResults(documentId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} introuvable`);
    }

    return document;
  }

  async processOcr(documentId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      this.logger.warn(`processOcr: Document ${documentId} introuvable`);
      return;
    }

    // Mark as processing
    await this.documentRepository.update(documentId, {
      ocrStatus: OcrStatus.PROCESSING,
    });

    try {
      // Retrieve file from MinIO as signed URL, then fetch buffer
      const signedUrl = await this.minioService.getSignedUrl(document.minioKey, 300);
      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error(`Échec récupération fichier: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Run OCR
      const ocrResult = await this.ocrService.processDocument(buffer, document.type);

      // Map status
      const ocrStatusMap: Record<string, OcrStatus> = {
        DONE: OcrStatus.DONE,
        FAILED: OcrStatus.FAILED,
        NEEDS_REVIEW: OcrStatus.NEEDS_REVIEW,
      };

      await this.documentRepository.update(documentId, {
        ocrStatus: ocrStatusMap[ocrResult.status] ?? OcrStatus.FAILED,
        ocrScore: ocrResult.globalScore,
        ocrData: {
          rawText: ocrResult.rawText,
          fields: ocrResult.fields,
        },
      });

      this.logger.log(
        JSON.stringify({
          action: 'OCR_COMPLETED',
          documentId,
          status: ocrResult.status,
          score: ocrResult.globalScore,
        }),
      );
    } catch (error) {
      this.logger.error('Erreur traitement OCR', { error, documentId });
      await this.documentRepository.update(documentId, {
        ocrStatus: OcrStatus.FAILED,
      });
    }
  }

  async getDeclarationDocuments(declarationId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { declarationId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async calculateAverageOcrScore(declarationId: string): Promise<number | null> {
    const result = await this.documentRepository
      .createQueryBuilder('d')
      .select('AVG(d.ocr_score)', 'average')
      .where('d.declaration_id = :declarationId', { declarationId })
      .andWhere('d.ocr_score IS NOT NULL')
      .getRawOne<{ average: string | null }>();

    if (!result?.average) return null;
    return Math.round(parseFloat(result.average));
  }
}
