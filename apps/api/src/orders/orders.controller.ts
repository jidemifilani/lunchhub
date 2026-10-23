import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  findAll(@Query('status') status: string, @CurrentUser() user: any) {
    const isStaff = ['ADMIN', 'CANTEEN_STAFF', 'KITCHEN_STAFF'].includes(user.role);
    return this.orders.findAll(isStaff ? undefined : user.id, status);
  }

  @Get('stats/today')
  todayStats() { return this.orders.todayStats(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.orders.findOne(id); }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.orders.create(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF', 'KITCHEN_STAFF')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: { status: string }) {
    return this.orders.updateStatus(id, dto.status);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.orders.cancel(id, user.id);
  }
}
