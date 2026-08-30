import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processEvent(dto: CreateEventDto) {
    // V2: farm must exist
    const farm = await this.prisma.farm.findUnique({
      where: { id: dto.farmId },
    });
    if (!farm) {
      throw new BadRequestException(`Farm ${dto.farmId} not found`);
    }

    // V3: device must exist and belong to the farm
    const device = await this.prisma.device.findUnique({
      where: { id: dto.deviceId },
    });
    if (!device) {
      throw new BadRequestException(
        `Device ${dto.deviceId} not found or does not belong to farm ${dto.farmId}`,
      );
    }
    if (device.farmId !== dto.farmId) {
      throw new BadRequestException(
        `Device ${dto.deviceId} not found or does not belong to farm ${dto.farmId}`,
      );
    }

    // Map DTO fields to DB fields
    const isEquipmentStatus = dto.type === EventType.EQUIPMENT_STATUS;
    const data = {
      id: dto.eventId,
      farmId: dto.farmId,
      deviceId: dto.deviceId,
      type: dto.type,
      value: isEquipmentStatus ? null : (dto.value as number),
      textValue: isEquipmentStatus ? (dto.value as string) : null,
      unit: isEquipmentStatus ? null : dto.unit,
      timestamp: new Date(dto.timestamp),
    };

    const persisted = await this.prisma.event.create({ data });

    this.eventEmitter.emit('event.received', persisted);

    return this.toResponse(persisted);
  }

  async findAll(
    limit: number,
    offset: number,
    type?: EventType,
  ): Promise<{ data: ReturnType<EventsService['toResponse']>[]; total: number }> {
    const where = type ? { type } : {};

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: data.map((e) => this.toResponse(e)),
      total,
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) return null;
    return this.toResponse(event);
  }

  private toResponse(event: {
    id: string;
    farmId: string;
    deviceId: string;
    type: string;
    value: number | null;
    textValue: string | null;
    unit: string | null;
    timestamp: Date;
    receivedAt: Date;
  }) {
    return {
      id: event.id,
      farmId: event.farmId,
      deviceId: event.deviceId,
      type: event.type,
      value: event.value,
      textValue: event.textValue,
      unit: event.unit,
      timestamp: event.timestamp.toISOString(),
      receivedAt: event.receivedAt.toISOString(),
    };
  }
}