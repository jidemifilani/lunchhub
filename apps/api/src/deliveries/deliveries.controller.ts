import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private deliveries: DeliveriesService) {}

  @Get('vendors')
  getVendors() { return this.deliveries.getVendors(); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Post('vendors')
  createVendor(@Body() dto: any) { return this.deliveries.createVendor(dto); }

  @Get()
  findAll(@Query('status') status?: string) { return this.deliveries.findAll(status); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.deliveries.findOne(id); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF', 'VENDOR')
  @Post()
  create(@Body() dto: any) { return this.deliveries.create(dto); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Post(':id/receive')
  receive(@Param('id') id: string, @Body() dto: { lines: { itemId: string; receivedQty: number }[] }) {
    return this.deliveries.receive(id, dto.lines);
  }

  @Post('items/:itemId/collect')
  collect(@Param('itemId') itemId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.deliveries.collect(itemId, user.id, Number(dto.qty), dto.purpose);
  }
}
