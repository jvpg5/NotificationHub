import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event as PrismaEvent } from '@prisma/client';
import { EventType } from 'shared-types';
import { RulesRegistry } from './rules.registry';
import { PrismaService } from '../prisma/prisma.service';

const EVENT_TYPES = new Set<string>(Object.values(EventType));

@Injectable()
export class RulesService {
  constructor(
    private readonly registry: RulesRegistry,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('event.received')
  async handleEventReceived(event: PrismaEvent) {
    // Farm lookup
    const farm = await this.prisma.farm.findUnique({
      where: { id: event.farmId },
    });
    if (!farm) {
      console.warn(
        `[RulesService] Farm ${event.farmId} not found — skipping event ${event.id}`,
      );
      return;
    }

    // Type resolution
    if (!EVENT_TYPES.has(event.type)) {
      console.warn(
        `[RulesService] Unknown event type "${event.type}" — skipping event ${event.id}`,
      );
      return;
    }
    const eventType = event.type as EventType;

    // Construct rule-input DTO from Prisma Event
    const isEquipmentStatus = eventType === EventType.EQUIPMENT_STATUS;
    const value = isEquipmentStatus ? event.textValue : event.value;
    if (value === null) {
      console.warn(
        `[RulesService] Event ${event.id} has null value — skipping`,
      );
      return;
    }
    const dto = {
      eventId: event.id,
      farmId: event.farmId,
      deviceId: event.deviceId,
      type: eventType,
      value,
      unit: event.unit ?? '',
      timestamp: event.timestamp.toISOString(),
    };

    // Rule lookup
    const rules = this.registry.getRulesForType(eventType);

    // Evaluate (with error containment per FR-9)
    for (const rule of rules) {
      try {
        const result = rule.evaluate(dto, { farmName: farm.name });
        if (result.triggered && result.notification) {
          this.eventEmitter.emit('notification.generated', {
            eventId: event.id,
            farmId: event.farmId,
            deviceId: event.deviceId,
            eventType: event.type,
            eventValue: dto.value,
            ruleTriggered: result.notification.ruleTriggered,
            severity: result.notification.severity,
            message: result.notification.message,
          });
          return; // At most one notification per event (FR-7)
        }
      } catch (error) {
        // FR-9: log and continue
        console.error(
          `Error evaluating rule ${rule.id} for event ${event.id}:`,
          error,
        );
      }
    }

    // No rule triggered — nothing to emit
  }
}