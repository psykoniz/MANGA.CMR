import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RulesEngineService } from './rules-engine.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Rule } from './entities/rule.entity';

@ApiTags('rules')
@Controller('rules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RulesEngineController {
  constructor(private rulesEngineService: RulesEngineService) {}

  @Get()
  @Roles(UserRole.ADMIN_METIER, UserRole.ADMIN_TECHNIQUE)
  async getAllRules(): Promise<Rule[]> {
    return this.rulesEngineService.getAllRules();
  }

  @Post('simulate')
  @Roles(UserRole.ADMIN_METIER, UserRole.ADMIN_TECHNIQUE)
  async simulate(@Body() body: { declarationId: string }): Promise<unknown> {
    return this.rulesEngineService.simulate(body.declarationId);
  }
}
