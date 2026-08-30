import { EventType, Severity, CreateEventDto } from 'shared-types';

export interface RuleNotificationPayload {
  ruleTriggered: string;
  severity: Severity;
  message: string;
}

export interface RuleResult {
  triggered: boolean;
  notification?: RuleNotificationPayload;
}

export interface RuleEvaluationContext {
  farmName: string;
}

export interface Rule {
  id: string;
  eventType: EventType;
  evaluate(event: CreateEventDto, context: RuleEvaluationContext): RuleResult;
}