import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DocumentsService } from '../documents.service';

interface OcrJobData {
  documentId: string;
}

@Processor('ocr-processing')
export class OcrProcessor {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(private readonly documentsService: DocumentsService) {}

  @Process('process-ocr')
  async handleOcrJob(job: Job<OcrJobData>): Promise<void> {
    const { documentId } = job.data;

    this.logger.log(
      JSON.stringify({
        action: 'OCR_JOB_STARTED',
        documentId,
        jobId: job.id,
        attempt: job.attemptsMade + 1,
      }),
    );

    try {
      await this.documentsService.processOcr(documentId);
      this.logger.log(
        JSON.stringify({ action: 'OCR_JOB_COMPLETED', documentId, jobId: job.id }),
      );
    } catch (error) {
      this.logger.error('Erreur traitement job OCR', {
        error,
        documentId,
        jobId: job.id,
        attempt: job.attemptsMade + 1,
      });
      throw error; // Rethrow so Bull can retry the job
    }
  }
}
