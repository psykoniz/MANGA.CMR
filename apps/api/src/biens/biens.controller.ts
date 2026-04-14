import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BiensService } from './biens.service';
import { Bien } from './entities/bien.entity';
import { BienMutation } from './entities/bien-mutation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('biens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('biens')
export class BiensController {
  constructor(private readonly biensService: BiensService) {}

  // ─── GET /search ───────────────────────────────────────────────────────────

  @Get('search')
  @ApiOperation({
    summary: 'Rechercher des biens par référence foncière, quartier ou arrondissement',
  })
  @ApiQuery({
    name: 'referenceFonciere',
    required: false,
    description: 'Référence foncière partielle ou complète',
  })
  @ApiQuery({
    name: 'quartier',
    required: false,
    description: 'Filtrer par quartier',
  })
  @ApiQuery({
    name: 'arrondissement',
    required: false,
    description: 'Filtrer par arrondissement',
  })
  @ApiResponse({ status: 200, description: 'Liste des biens correspondants', type: [Bien] })
  search(
    @Query('referenceFonciere') referenceFonciere: string | undefined,
    @Query('quartier') quartier: string | undefined,
    @Query('arrondissement') arrondissement: string | undefined,
  ): Promise<Bien[]> {
    return this.biensService.search({ referenceFonciere, quartier, arrondissement });
  }

  // ─── GET /:id ──────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un bien par son identifiant' })
  @ApiResponse({ status: 200, description: 'Bien trouvé', type: Bien })
  @ApiResponse({ status: 404, description: 'Bien introuvable' })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<Bien> {
    return this.biensService.findById(id);
  }

  // ─── GET /:id/history ──────────────────────────────────────────────────────

  @Get(':id/history')
  @ApiOperation({
    summary: "Récupérer l'historique des mutations d'un bien",
  })
  @ApiResponse({
    status: 200,
    description: 'Historique des mutations',
    type: [BienMutation],
  })
  @ApiResponse({ status: 404, description: 'Bien introuvable' })
  getHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BienMutation[]> {
    return this.biensService.getHistory(id);
  }
}
