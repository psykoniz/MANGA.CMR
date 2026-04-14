import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule, RuleAction } from './entities/rule.entity';
import { RuleEvaluation } from './entities/rule-evaluation.entity';

export interface EvaluationContext {
  declarationId: string;
  ocrScoreGlobal: number;
  certProprieteAgeDays: number;
  inPreemptionZone: boolean;
  fraudFlags: number;
  referenceFonciereDuplicate: boolean;
  montantDeclare: number;
}

export interface EvaluationResult {
  action: RuleAction;
  matchedRule?: Rule;
  rejectionMessage?: string;
  evaluations: RuleEvaluation[];
}

@Injectable()
export class RulesEngineService {
  private readonly logger = new Logger(RulesEngineService.name);

  constructor(
    @InjectRepository(Rule)
    private ruleRepo: Repository<Rule>,
    @InjectRepository(RuleEvaluation)
    private evalRepo: Repository<RuleEvaluation>,
  ) {}

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    try {
      const rules = await this.ruleRepo.find({
        where: { isActive: true },
        order: { priority: 'ASC' },
      });

      const evaluations: RuleEvaluation[] = [];
      let finalAction = RuleAction.NEEDS_REVIEW;
      let matchedRule: Rule | undefined;
      const evaluationsToInsert: RuleEvaluation[] = [];

      for (const rule of rules) {
        const matched = this.evaluateCondition(context, rule.conditionJson);
        const evaluation = this.evalRepo.create({
          declarationId: context.declarationId,
          ruleId: rule.id,
          ruleName: rule.name,
          matched,
          actionTaken: matched ? rule.action : undefined,
          inputData: context,
        });
        evaluationsToInsert.push(evaluation);

        if (matched) {
          if (
            rule.action === RuleAction.REJECT ||
            rule.action === RuleAction.FLAG_FRAUD ||
            rule.action === RuleAction.ESCALATE
          ) {
            finalAction = rule.action;
            matchedRule = rule;
            break;
          }

          if (rule.action === RuleAction.AUTO_APPROVE) {
            finalAction = RuleAction.AUTO_APPROVE;
            matchedRule = rule;
          }
        }
      }

      // Batch insert all evaluations
      if (evaluationsToInsert.length > 0) {
        const saved = await this.evalRepo.save(evaluationsToInsert);
        evaluations.push(...saved);
      }

      this.logger.log(
        JSON.stringify({
          action: 'RULES_EVALUATED',
          declarationId: context.declarationId,
          finalAction,
          ruleCount: rules.length,
        }),
      );

      return { action: finalAction, matchedRule, evaluations };
    } catch (error) {
      this.logger.error('Erreur évaluation règles', { error });
      throw error;
    }
  }

  private evaluateCondition(context: EvaluationContext, condition: Record<string, unknown>): boolean {
    if ('and' in condition) {
      return (condition['and'] as Record<string, unknown>[]).every((c) =>
        this.evaluateCondition(context, c),
      );
    }
    if ('or' in condition) {
      return (condition['or'] as Record<string, unknown>[]).some((c) =>
        this.evaluateCondition(context, c),
      );
    }

    const field = String(condition['field'] ?? '');
    const operator = String(condition['operator'] ?? '');
    const value = condition['value'];

    const contextValue = (context as Record<string, unknown>)[field];

    // Type safety: validate field exists
    if (contextValue === undefined) {
      return false;
    }

    switch (operator) {
      case '>':
        return typeof contextValue === 'number' && typeof value === 'number' && contextValue > value;
      case '>=':
        return typeof contextValue === 'number' && typeof value === 'number' && contextValue >= value;
      case '<':
        return typeof contextValue === 'number' && typeof value === 'number' && contextValue < value;
      case '<=':
        return typeof contextValue === 'number' && typeof value === 'number' && contextValue <= value;
      case '=':
        return contextValue === value;
      case '!=':
        return contextValue !== value;
      default:
        return false;
    }
  }

  async getAllRules(): Promise<Rule[]> {
    return this.ruleRepo.find({ order: { priority: 'ASC' } });
  }

  async simulate(_declarationId: string): Promise<EvaluationResult> {
    // Stub: in production, build context from DB
    // For testing: skip and throw or return empty
    throw new Error('Simulate requires database context - not implemented in MVP');
  }
}
