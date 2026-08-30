import { EventType, Severity, CreateEventDto } from 'shared-types';
import { Rule, RuleResult, RuleEvaluationContext } from '../interfaces/rule.interface';

export class AirHumidityRule implements Rule {
  id = 'AIR_HUMIDITY_LOW';
  eventType = EventType.AIR_HUMIDITY;

  evaluate(event: CreateEventDto, context: RuleEvaluationContext): RuleResult {
    const value = event.value as number;
    if (value < 30) {
      return {
        triggered: true,
        notification: {
          ruleTriggered: this.id,
          severity: Severity.INFO,
          message: `⚠️ Low humidity alert: air humidity reached ${value}% at ${context.farmName}.`,
        },
      };
    }
    return { triggered: false };
  }
}