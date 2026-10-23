import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // Categories
  getCategories() {
    return this.prisma.menuCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { items: true } });
  }

  createCategory(dto: any) {
    return this.prisma.menuCategory.create({ data: dto });
  }

  // Items
  getItems(categoryId?: string) {
    return this.prisma.menuItem.findMany({
      where: categoryId ? { categoryId, isAvailable: true } : { isAvailable: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async getItem(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id }, include: { category: true } });
    if (!item) throw new NotFoundException('Menu item not found.');
    return item;
  }

  createItem(dto: any) {
    return this.prisma.menuItem.create({ data: dto, include: { category: true } });
  }

  updateItem(id: string, dto: any) {
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  deleteItem(id: string) {
    return this.prisma.menuItem.update({ where: { id }, data: { isAvailable: false } });
  }

  // Daily menu
  async getDailyMenu(date: string) {
    const d = new Date(date);
    return this.prisma.dailyMenu.findFirst({
      where: { date: d, isPublished: true },
      include: { items: { include: { item: { include: { category: true } } } } },
    });
  }

  async upsertDailyMenu(date: string, itemIds: string[]) {
    const d = new Date(date);
    let menu = await this.prisma.dailyMenu.findFirst({ where: { date: d } });
    if (!menu) {
      menu = await this.prisma.dailyMenu.create({ data: { date: d } });
    }
    // Replace items
    await this.prisma.dailyMenuItem.deleteMany({ where: { menuId: menu.id } });
    for (const itemId of itemIds) {
      await this.prisma.dailyMenuItem.create({ data: { menuId: menu.id, itemId } });
    }
    return this.getDailyMenu(date);
  }

  publishDailyMenu(date: string) {
    const d = new Date(date);
    return this.prisma.dailyMenu.update({ where: { date: d }, data: { isPublished: true } });
  }
}
