import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { IdempotencyGuard } from '../common/guards/idempotency.guard';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [EventsController],
  providers: [EventsService, IdempotencyGuard],
})
export class EventsModule {}