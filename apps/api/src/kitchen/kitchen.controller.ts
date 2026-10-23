import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('kitchen')
export class KitchenController {
  constructor(private kitchen: KitchenService) {}

  @Get()
  getQueue(@Query('status') status?: string) { return this.kitchen.getQueue(status); }

  @Get('stats')
  stats() { return this.kitchen.stats(); }

  @Post(':id/start')
  start(@Param('id') id: string) { return this.kitchen.startTicket(id); }

  @Post(':id/done')
  done(@Param('id') id: string) { return this.kitchen.doneTicket(id); }

  @Post(':id/serve')
  serve(@Param('id') id: string) { return this.kitchen.serveTicket(id); }
}
