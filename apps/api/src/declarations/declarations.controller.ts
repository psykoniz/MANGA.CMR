import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeclarationsService } from './declarations.service';
import {
  CreateDeclarationDto,
  ReviewDeclarationDto,
  SignDeclarationDto,
  SubmitDeclarationDto,
  UpdateDeclarationDto,
} from './dto/declaration.dto';
import { Declaration } from './entities/declaration.entity';
import { DeclarationEvent } from './entities/declaration-event.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

@ApiTags('declarations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('declarations')
export class DeclarationsController {
  constructor(private readonly declarationsService: DeclarationsService) {}

  // ─── POST / ─────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle déclaration (brouillon)' })
  @ApiResponse({ status: 201, description: 'Déclaration créée', type: Declaration })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(
    @Body() dto: CreateDeclarationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Declaration> {
    return this.declarationsService.create(dto, req.user.id);
  }

  // ─── PUT /:id ───────────────────────────────────────────────────────────────

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une déclaration en brouillon' })
  @ApiResponse({ status: 200, description: 'Déclaration mise à jour', type: Declaration })
  @ApiResponse({ status: 400, description: 'Statut incompatible' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Dossier introuvable' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeclarationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Declaration> {
    return this.declarationsService.update(id, dto, req.user.id);
  }

  // ─── POST /:id/submit ───────────────────────────────────────────────────────

  @Post(':id/submit')
  @ApiOperation({ summary: 'Soumettre une déclaration (passage en attente de paiement)' })
  @ApiResponse({ status: 200, description: 'Déclaration soumise', type: Declaration })
  @ApiResponse({ status: 400, description: 'Statut incompatible' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Dossier introuvable' })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() _dto: SubmitDeclarationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Declaration> {
    return this.declarationsService.submit(id, req.user.id);
  }

  // ─── POST /:id/sign ─────────────────────────────────────────────────────────

  @Post(':id/sign')
  @ApiOperation({ summary: 'Signer une déclaration avec le code OTP' })
  @ApiResponse({ status: 200, description: 'Déclaration signée et soumise', type: Declaration })
  @ApiResponse({ status: 400, description: 'Code OTP invalide ou statut incompatible' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Dossier introuvable' })
  sign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SignDeclarationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Declaration> {
    return this.declarationsService.sign(id, dto.otpCode, req.user.id);
  }

  // ─── GET /:id ───────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une déclaration par son identifiant' })
  @ApiResponse({ status: 200, description: 'Déclaration trouvée', type: Declaration })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Dossier introuvable' })
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Declaration> {
    return this.declarationsService.getById(id, req.user.id, req.user.role);
  }

  // ─── GET /:id/timeline ──────────────────────────────────────────────────────

  @Get(':id/timeline')
  @ApiOperation({ summary: "Récupérer la timeline d'événements d'une déclaration" })
  @ApiResponse({ status: 200, description: 'Timeline des événements', type: [DeclarationEvent] })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Dossier introuvable' })
  getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<DeclarationEvent[]> {
    return this.declarationsService.getTimeline(id, req.user.id, req.user.role);
  }

  // ─── GET / ──────────────────────────────────────────────────────────────────

  @Get()
  @Roles('INSTRUCTEUR', 'SUPERVISEUR', 'SIGNATAIRE', 'ADMIN_METIER', 'ADMIN_TECHNIQUE', 'CITIZEN')
  @ApiOperation({ summary: 'Lister les déclarations (avec filtres et pagination)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page (défaut: 1)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre de résultats par page (défaut: 20, max: 100)', type: Number })
  @ApiResponse({ status: 200, description: 'Liste paginée des déclarations' })
  list(
    @Query('status') status: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ data: Declaration[]; total: number }> {
    return this.declarationsService.list(
      {
        status,
        page: page !== undefined ? parseInt(page, 10) : undefined,
        limit: limit !== undefined ? parseInt(limit, 10) : undefined,
      },
      req.user.role,
      req.user.id,
    );
  }

  // ─── POST /:id/review ───────────────────────────────────────────────────────

  @Post(':id/review')
  @Roles('INSTRUCTEUR', 'SUPERVISEUR', 'SIGNATAIRE', 'ADMIN_METIER', 'ADMIN_TECHNIQUE')
  @ApiOperation({ summary: "Instruire une déclaration (valider, rejeter ou demander un complément d'information)" })
  @ApiResponse({ status: 200, description: 'Déclaration instruite', type: Declaration })
  @ApiResponse({ status: 400, description: 'Statut incompatible ou données invalides' })
  @ApiResponse({ status: 403, description: 'Rôle insuffisant' })
  @ApiResponse({ status: 404, description: 'Dossier introuvable' })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewDeclarationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Declaration> {
    return this.declarationsService.review(id, dto, req.user.id);
  }
}
