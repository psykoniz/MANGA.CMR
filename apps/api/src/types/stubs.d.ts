// Type stubs for optional runtime dependencies not installed in dev
declare module '@aws-sdk/client-s3' {
  export class S3Client { constructor(config: Record<string, unknown>); send(cmd: unknown): Promise<unknown>; }
  export class PutObjectCommand { constructor(input: Record<string, unknown>); }
  export class GetObjectCommand { constructor(input: Record<string, unknown>); }
  export class DeleteObjectCommand { constructor(input: Record<string, unknown>); }
  export class HeadObjectCommand { constructor(input: Record<string, unknown>); }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(client: unknown, command: unknown, options?: Record<string, unknown>): Promise<string>;
}

declare module 'tesseract.js' {
  export function recognize(image: unknown, lang?: string, options?: Record<string, unknown>): Promise<{ data: { text: string; confidence: number } }>;
  export function createWorker(lang?: string): Promise<{
    recognize(image: unknown): Promise<{ data: { text: string; confidence: number } }>;
    terminate(): Promise<void>;
  }>;
}
