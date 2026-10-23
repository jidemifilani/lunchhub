import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private nextOrderNo() {
    return `ORD-${Date.now().toString(36).toUpperCase()}`;
  }

  findAll(userId?: string, status?: string) {
    return this.prisma.order.findMany({
      where: { ...(userId ? { userId } : {}), ...(status ? { status: status as any } : {}) },
      include: { items: { include: { item: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const o = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { item: true } }, user: { select: { name: true } }, kitchenTicket: true },
    });
    if (!o) throw new NotFoundException('Order not found.');
    return o;
  }

  async create(userId: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
      // Fetch items and calculate totals
      let subtotal = 0;
      const lines = [];
      for (const line of dto.items) {
        const item = await tx.menuItem.findUnique({ where: { id: line.itemId } });
        if (!item) throw new BadRequestException(`Item ${line.itemId} not found.`);
        const lineTotal = Number(item.price) * line.qty;
        subtotal += lineTotal;
        lines.push({ itemId: item.id, qty: line.qty, unitPrice: item.price, lineTotal, notes: line.notes });
      }
      const total = subtotal;

      // Deduct from wallet if payment mode is WALLET
      if (dto.paymentMode === 'WALLET' || !dto.paymentMode) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (Number(user.walletBalance) < total) {
          throw new BadRequestException('Insufficient wallet balance.');
        }
        const updated = await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: total } },
        });
        await tx.walletTransaction.create({
          data: { userId, type: 'DEDUCTION', amount: total, balAfter: updated.walletBalance, note: 'Order payment' },
        });
      }

      const order = await tx.order.create({
        data: {
          orderNo: this.nextOrderNo(),
          userId,
          type: dto.type || 'CANTEEN',
          pickupTime: dto.pickupTime ? new Date(dto.pickupTime) : null,
          notes: dto.notes,
          subtotal,
          total,
          paymentMode: dto.paymentMode || 'WALLET',
          paidAt: new Date(),
          items: { create: lines },
        },
        include: { items: { include: { item: true } } },
      });

      // Create kitchen ticket
      await tx.kitchenTicket.create({ data: { orderId: order.id } });
      return order;
    });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.order.update({ where: { id }, data: { status: status as any } });
  }

  async cancel(id: string, userId: string) {
    const order = await this.findOne(id);
    if (order.status !== 'PENDING') throw new BadRequestException('Only pending orders can be cancelled.');

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });
      if (order.paymentMode === 'WALLET') {
        const user = await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: Number(order.total) } },
        });
        await tx.walletTransaction.create({
          data: { userId, type: 'REFUND', amount: Number(order.total), balAfter: user.walletBalance, orderId: id, note: 'Order cancelled' },
        });
      }
      return { cancelled: true };
    });
  }

  todayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.order.aggregate({
      where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
      _count: true,
      _sum: { total: true },
    });
  }
}
