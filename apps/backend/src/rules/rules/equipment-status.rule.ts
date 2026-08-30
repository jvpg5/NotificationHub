import { EventType, Severity, CreateEventDto } from 'shared-types';
import { Rule, RuleResult, RuleEvaluationContext } from '../interfaces/rule.interface';

export class EquipmentStatusRule implements Rule {
  id = 'EQUIPMENT_FAILURE';
  eventType = EventType.EQUIPMENT_STATUS;

  evaluate(event: CreateEventDto, _context: RuleEvaluationContext): RuleResult {
    if (event.value === 'FAILURE') {
      return {
        triggered: true,
        notification: {
          ruleTriggered: this.id,
          severity: Severity.CRITICAL,
          message: `🚨 Equipment failure: a failure was detected on equipment ${event.deviceId}.`,
        },
      };
    }
    return { triggered: false };
  }
}