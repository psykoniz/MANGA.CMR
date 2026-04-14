import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService, SignedUrlResult } from './documents.service';
import { Document, DocumentType } from './entities/document.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

interface UploadDocumentBody {
  declarationId: string;
  documentType: string;
}

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentBody,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ documentId: string; minioKey: string; sha256Checksum: string }> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const { declarationId, documentType } = body;

    if (!declarationId) {
      throw new BadRequestException('declarationId est requis');
    }

    const validDocumentTypes = Object.values(DocumentType) as string[];
    if (!documentType || !validDocumentTypes.includes(documentType)) {
      throw new BadRequestException(
        `documentType invalide. Valeurs acceptées : ${validDocumentTypes.join(', ')}`,
      );
    }

    return this.documentsService.upload(
      file,
      declarationId,
      documentType as DocumentType,
      req.user.id,
    );
  }

  @Get(':id/download')
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<SignedUrlResult> {
    return this.documentsService.getSignedUrl(id, req.user.id, req.user.role);
  }

  @Get(':id/ocr')
  @Roles('INSTRUCTEUR', 'ADMIN_METIER', 'SUPER_ADMIN')
  async getOcrResults(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Document> {
    return this.documentsService.getOcrResults(id);
  }
}
