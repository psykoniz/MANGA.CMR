import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly signedUrlExpires: number;

  constructor(private readonly configService: ConfigService) {
    const endpoint = configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = configService.get<number>('MINIO_PORT', 9000);
    const useSsl = configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    this.bucket = configService.get<string>('MINIO_BUCKET', 'predem-docs');
    this.signedUrlExpires = configService.get<number>('MINIO_SIGNED_URL_EXPIRES', 900);

    this.s3Client = new S3Client({
      endpoint: `${useSsl ? 'https' : 'http'}://${endpoint}:${port}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: configService.get<string>('MINIO_SECRET_KEY', 'minioadmin123'),
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<void> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      this.logger.log(JSON.stringify({ action: 'FILE_UPLOADED', key, size: buffer.length }));
    } catch (error) {
      this.logger.error('Erreur upload MinIO', { error, key });
      throw new ServiceUnavailableException('Erreur lors du stockage du fichier');
    }
  }

  async getSignedUrl(key: string, expiresInSeconds?: number): Promise<string> {
    try {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
      return getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds ?? this.signedUrlExpires,
      });
    } catch (error) {
      this.logger.error('Erreur génération URL signée', { error, key });
      throw new ServiceUnavailableException('Erreur lors de la récupération du fichier');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      this.logger.error('Erreur suppression fichier MinIO', { error, key });
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  generateKey(declarationId: string, documentType: string, originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    return `declarations/${declarationId}/${documentType}/${Date.now()}-${uuidv4()}${ext}`;
  }
}
