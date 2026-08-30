import { EventType, Severity, CreateEventDto } from 'shared-types';
import { Rule, RuleResult, RuleEvaluationContext } from '../interfaces/rule.interface';

export class AirTemperatureRule implements Rule {
  id = 'AIR_TEMPERATURE_HIGH';
  eventType = EventType.AIR_TEMPERATURE;

  evaluate(event: CreateEventDto, context: RuleEvaluationContext): RuleResult {
    const value = event.value as number;
    if (value > 35) {
      return {
        triggered: true,
        notification: {
          ruleTriggered: this.id,
          severity: Severity.WARNING,
          message: `⚠️ Temperature alert: ${value}°C recorded by sensor ${event.deviceId} at ${context.farmName}.`,
        },
      };
    }
    return { triggered: false };
  }
}