import { EventType, Severity, CreateEventDto } from 'shared-types';
import { Rule, RuleResult, RuleEvaluationContext } from '../interfaces/rule.interface';

export class WaterReservoirLevelRule implements Rule {
  id = 'WATER_RESERVOIR_LOW';
  eventType = EventType.WATER_RESERVOIR_LEVEL;

  evaluate(event: CreateEventDto, context: RuleEvaluationContext): RuleResult {
    const value = event.value as number;
    if (value < 15) {
      return {
        triggered: true,
        notification: {
          ruleTriggered: this.id,
          severity: Severity.WARNING,
          message: `💧 Low water level: the reservoir is at only ${value}% of capacity.`,
        },
      };
    }
    return { triggered: false };
  }
}