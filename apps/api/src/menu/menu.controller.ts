import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private menu: MenuService) {}

  @Get('categories')
  getCategories() { return this.menu.getCategories(); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Post('categories')
  createCategory(@Body() dto: any) { return this.menu.createCategory(dto); }

  @Get('items')
  getItems(@Query('categoryId') categoryId?: string) { return this.menu.getItems(categoryId); }

  @Get('items/:id')
  getItem(@Param('id') id: string) { return this.menu.getItem(id); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Post('items')
  createItem(@Body() dto: any) { return this.menu.createItem(dto); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: any) { return this.menu.updateItem(id, dto); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Delete('items/:id')
  deleteItem(@Param('id') id: string) { return this.menu.deleteItem(id); }

  @Get('daily')
  getDailyMenu(@Query('date') date: string) {
    return this.menu.getDailyMenu(date || new Date().toISOString().split('T')[0]);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Post('daily')
  upsertDailyMenu(@Body() dto: { date: string; itemIds: string[] }) {
    return this.menu.upsertDailyMenu(dto.date, dto.itemIds);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Post('daily/publish')
  publishDailyMenu(@Body() dto: { date: string }) {
    return this.menu.publishDailyMenu(dto.date);
  }
}
