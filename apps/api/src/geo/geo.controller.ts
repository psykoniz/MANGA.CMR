import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GeoService } from './geo.service';
import { CheckPreemptionDto, GeoLocateDto, CreateZoneDto } from './dto/geo.dto';
import { ZonePreemption } from './entities/zone-preemption.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

interface PreemptionCheckResult {
  inZone: boolean;
  zoneName?: string;
  zoneType?: string;
  zoneId?: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

@Controller('geo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Post('check-preemption')
  @Public()
  async checkPreemption(
    @Body() dto: CheckPreemptionDto,
  ): Promise<PreemptionCheckResult> {
    return this.geoService.checkPreemption(dto.lat, dto.lng);
  }

  @Get('zones')
  @Public()
  async getZones(): Promise<ZonePreemption[]> {
    return this.geoService.getZones();
  }

  @Post('zones')
  @Roles('ADMIN_METIER', 'SUPER_ADMIN')
  async createZone(
    @Body() dto: CreateZoneDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ZonePreemption> {
    return this.geoService.createZone(dto, req.user.id);
  }

  @Post('locate')
  async locate(
    @Body() dto: GeoLocateDto,
    @Request() _req: AuthenticatedRequest,
  ): Promise<PreemptionCheckResult & { declarationId: string }> {
    const result = await this.geoService.checkPreemption(dto.lat, dto.lng);
    return { ...result, declarationId: dto.declarationId };
  }
}
