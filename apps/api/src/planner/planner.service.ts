import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlannerService {
  constructor(private prisma: PrismaService) {}

  getWeekPlan(userId: string, weekStart: string) {
    return this.prisma.mealPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart: new Date(weekStart) } },
      include: { items: { include: { item: true } } },
    });
  }

  async upsertPlan(userId: string, weekStart: string, items: any[]) {
    const plan = await this.prisma.mealPlan.upsert({
      where: { userId_weekStart: { userId, weekStart: new Date(weekStart) } },
      create: { userId, weekStart: new Date(weekStart) },
      update: {},
    });
    await this.prisma.mealPlanItem.deleteMany({ where: { planId: plan.id } });
    await this.prisma.mealPlanItem.createMany({
      data: items.map((i) => ({ ...i, planId: plan.id })),
    });
    return this.getWeekPlan(userId, weekStart);
  }

  nutritionSummary(userId: string, weekStart: string) {
    return this.prisma.mealPlanItem.aggregate({
      where: { plan: { userId, weekStart: new Date(weekStart) } },
      _sum: { calories: true },
    });
  }
}
