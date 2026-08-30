import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const eventId = request.body?.eventId;

    if (!eventId) {
      return true; // let validation pipe reject missing eventId
    }

    const existing = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (existing) {
      const body = {
        id: existing.id,
        farmId: existing.farmId,
        deviceId: existing.deviceId,
        type: existing.type,
        value: existing.value,
        textValue: existing.textValue,
        unit: existing.unit,
        timestamp: existing.timestamp.toISOString(),
        receivedAt: existing.receivedAt.toISOString(),
        duplicate: true,
      };
      response.status(HttpStatus.OK).json(body);
      return false; // handler won't execute; response already committed
    }

    return true;
  }
}