import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { Document } from './entities/document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MinioService } from './services/minio.service';
import { OcrService } from './services/ocr.service';
import { OcrProcessor } from './processors/ocr.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    BullModule.registerQueue({
      name: 'ocr-processing',
    }),
    MulterModule.register({
      limits: {
        fileSize: 10_485_760, // 10 MB
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, MinioService, OcrService, OcrProcessor],
  exports: [DocumentsService, MinioService],
})
export class DocumentsModule {}
