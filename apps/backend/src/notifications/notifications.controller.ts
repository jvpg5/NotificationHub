import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return this.notificationsService.findAll(Math.min(limit, 100), offset, status, severity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const notification = await this.notificationsService.findOne(id);
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);
    return notification;
  }
}