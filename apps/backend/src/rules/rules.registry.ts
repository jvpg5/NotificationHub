import { Injectable } from '@nestjs/common';
import { EventType } from 'shared-types';
import { Rule } from './interfaces/rule.interface';

@Injectable()
export class RulesRegistry {
  private readonly rules = new Map<string, Rule>();

  register(rule: Rule): void {
    this.rules.set(rule.id, rule);
  }

  getRulesForType(eventType: EventType): Rule[] {
    return Array.from(this.rules.values()).filter(
      (rule) => rule.eventType === eventType,
    );
  }
}