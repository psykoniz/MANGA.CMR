import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AttestationsService } from './attestations.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/guards/roles.guard';

@ApiTags('attestations')
@Controller('attestations')
export class AttestationsController {
  constructor(private attestationsService: AttestationsService) {}

  @Public()
  @Get('verify')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async verify(
    @Query('reference') reference: string,
    @Query('codeControle') codeControle: string,
  ): Promise<unknown> {
    return this.attestationsService.verify(reference, codeControle);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/download')
  async download(@Param('id') id: string): Promise<{ signedUrl: string; expiresAt: string }> {
    const signedUrl = await this.attestationsService.getDownloadUrl(id);
    return { signedUrl, expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/revoke')
  @Roles(UserRole.SIGNATAIRE, UserRole.ADMIN_TECHNIQUE)
  async revoke(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: CurrentUserData,
  ): Promise<unknown> {
    return this.attestationsService.revoke(id, body.reason, user.id);
  }
}
