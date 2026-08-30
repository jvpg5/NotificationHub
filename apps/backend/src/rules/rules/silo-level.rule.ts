import { EventType, Severity, CreateEventDto } from 'shared-types';
import { Rule, RuleResult, RuleEvaluationContext } from '../interfaces/rule.interface';

export class SiloLevelRule implements Rule {
  id = 'SILO_LEVEL_LOW';
  eventType = EventType.SILO_LEVEL;

  evaluate(event: CreateEventDto, _context: RuleEvaluationContext): RuleResult {
    const value = event.value as number;
    if (value < 15) {
      return {
        triggered: true,
        notification: {
          ruleTriggered: this.id,
          severity: Severity.WARNING,
          message: `⚠️ Low silo level: the silo monitored by ${event.deviceId} is at ${value}% of capacity.`,
        },
      };
    }
    return { triggered: false };
  }
}