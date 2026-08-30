import {
  IsString,
  IsNotEmpty,
  IsEnum,
  Validate,
  Matches,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EventType, EquipmentStatus } from 'shared-types';

// V5 + V6: value validation per event type
@ValidatorConstraint({ name: 'isValidEventValue', async: false })
export class IsValidEventValueConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    const dto = args.object as { type?: EventType };
    const eventType = dto.type;

    // If type is not a valid EventType, let @IsEnum on type handle it
    if (
      eventType === undefined ||
      !Object.values(EventType).includes(eventType)
    ) {
      return true;
    }

    if (eventType === EventType.EQUIPMENT_STATUS) {
      return (
        typeof value === 'string' &&
        Object.values(EquipmentStatus).includes(value as EquipmentStatus)
      );
    }

    if (eventType === EventType.AIR_TEMPERATURE) {
      return typeof value === 'number' && value >= -20 && value <= 60;
    }

    // All other sensor types: number, 0 to 100
    return typeof value === 'number' && value >= 0 && value <= 100;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as { type?: EventType; value?: unknown };
    const eventType = dto.type;

    if (dto.value === undefined || dto.value === null) {
      return 'value is required';
    }

    if (eventType === EventType.EQUIPMENT_STATUS) {
      return 'value must be one of: OK, FAILURE, MAINTENANCE';
    }

    if (eventType === EventType.AIR_TEMPERATURE) {
      return 'value must be a number between -20 and 60';
    }

    return 'value must be a number between 0 and 100';
  }
}

// V7: unit validation per event type
@ValidatorConstraint({ name: 'isValidEventUnit', async: false })
export class IsValidEventUnitConstraint
  implements ValidatorConstraintInterface
{
  validate(unit: unknown, args: ValidationArguments): boolean {
    const dto = args.object as { type?: EventType };
    const eventType = dto.type;

    // If type is undefined or not a valid EventType, let @IsEnum handle it
    if (
      eventType === undefined ||
      !Object.values(EventType).includes(eventType)
    ) {
      return true;
    }

    if (eventType === EventType.EQUIPMENT_STATUS) {
      return unit === null;
    }

    if (eventType === EventType.AIR_TEMPERATURE) {
      return unit === 'C';
    }

    // All other sensor types
    return unit === '%';
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as { type?: EventType };
    const eventType = dto.type;

    if (eventType === EventType.EQUIPMENT_STATUS) {
      return 'unit must be null for EQUIPMENT_STATUS';
    }

    if (eventType === EventType.AIR_TEMPERATURE) {
      return 'unit must be "C" for AIR_TEMPERATURE';
    }

    return 'unit must be "%" for this event type';
  }
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @IsString()
  @IsNotEmpty()
  farmId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsEnum(EventType)
  type!: EventType;

  @Validate(IsValidEventValueConstraint)
  value!: number | string;

  @Validate(IsValidEventUnitConstraint)
  unit!: string | null;

  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/, {
    message: 'timestamp must be a valid ISO 8601 date string with timezone offset',
  })
  timestamp!: string;
}