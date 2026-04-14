import { Injectable, Logger } from '@nestjs/common';

interface OcrField {
  value: string | null;
  confidence: number;
}

export interface OcrResult {
  rawText: string;
  fields: {
    nom?: OcrField;
    prenom?: OcrField;
    numeroPiece?: OcrField;
    referenceFonciere?: OcrField;
    superficie?: OcrField;
    dateEmission?: OcrField;
    dateExpiration?: OcrField;
  };
  globalScore: number;
  status: 'DONE' | 'FAILED' | 'NEEDS_REVIEW';
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async processDocument(buffer: Buffer, documentType: string): Promise<OcrResult> {
    try {
      // Tesseract.js integration - dynamically imported to avoid SSR issues
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('fra+eng');
      const { data } = await worker.recognize(buffer);
      await worker.terminate();

      const rawText = data.text;
      const fields = this.extractFields(rawText, documentType);

      const scores = Object.values(fields)
        .filter((f): f is OcrField => f !== undefined)
        .map((f) => f.confidence);

      const globalScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      return {
        rawText,
        fields,
        globalScore,
        status: globalScore < 60 ? 'NEEDS_REVIEW' : 'DONE',
      };
    } catch (error) {
      this.logger.error('Erreur OCR Tesseract', { error, documentType });
      return { rawText: '', fields: {}, globalScore: 0, status: 'FAILED' };
    }
  }

  async calculateDocumentAge(ocrResult: OcrResult): Promise<number | null> {
    const dateField = ocrResult.fields.dateEmission;
    if (!dateField?.value) return null;
    try {
      const parts = dateField.value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!parts) return null;
      const docDate = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
      return Math.floor((Date.now() - docDate.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  }

  private extractFields(text: string, _documentType: string): OcrResult['fields'] {
    return {
      referenceFonciere: this.extractField(text, /TF\s+[\d]+\/[\w-]+/i),
      superficie: this.extractField(text, /(\d+(?:[.,]\d+)?)\s*m[²2]/i),
      dateEmission: this.extractField(text, /\b(\d{2}\/\d{2}\/\d{4})\b/),
      dateExpiration: this.extractField(text, /expir[eé]\s+le\s+(\d{2}\/\d{2}\/\d{4})/i),
      numeroPiece: this.extractField(text, /n[°o]\.?\s*([\w\d-]{5,20})/i),
    };
  }

  private extractField(text: string, pattern: RegExp): OcrField {
    const match = text.match(pattern);
    return match
      ? { value: match[1] ?? match[0], confidence: 85 }
      : { value: null, confidence: 0 };
  }
}
