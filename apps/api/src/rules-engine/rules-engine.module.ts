import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulesEngineService } from './rules-engine.service';
import { RulesEngineController } from './rules-engine.controller';
import { Rule } from './entities/rule.entity';
import { RuleEvaluation } from './entities/rule-evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rule, RuleEvaluation])],
  providers: [RulesEngineService],
  controllers: [RulesEngineController],
  exports: [RulesEngineService],
})
export class RulesEngineModule {}
