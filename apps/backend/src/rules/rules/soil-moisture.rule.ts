import { EventType, Severity, CreateEventDto } from 'shared-types';
import { Rule, RuleResult, RuleEvaluationContext } from '../interfaces/rule.interface';

export class SoilMoistureRule implements Rule {
  id = 'SOIL_MOISTURE_LOW';
  eventType = EventType.SOIL_MOISTURE;

  evaluate(event: CreateEventDto, _context: RuleEvaluationContext): RuleResult {
    const value = event.value as number;
    if (value < 20) {
      return {
        triggered: true,
        notification: {
          ruleTriggered: this.id,
          severity: Severity.INFO,
          message: `💧 Irrigation alert: soil moisture is at ${value}%. Check irrigation needs.`,
        },
      };
    }
    return { triggered: false };
  }
}