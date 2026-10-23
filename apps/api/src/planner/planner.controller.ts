import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { PlannerService } from './planner.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('planner')
export class PlannerController {
  constructor(private planner: PlannerService) {}

  @Get()
  getWeek(@CurrentUser() u: any, @Query('weekStart') weekStart: string) {
    return this.planner.getWeekPlan(u.id, weekStart || mondayOfWeek());
  }

  @Post()
  upsert(@CurrentUser() u: any, @Body() dto: { weekStart: string; items: any[] }) {
    return this.planner.upsertPlan(u.id, dto.weekStart, dto.items);
  }

  @Get('nutrition')
  nutrition(@CurrentUser() u: any, @Query('weekStart') weekStart: string) {
    return this.planner.nutritionSummary(u.id, weekStart || mondayOfWeek());
  }
}

function mondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}
