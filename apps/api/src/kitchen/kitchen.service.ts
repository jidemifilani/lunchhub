import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KitchenService {
  constructor(private prisma: PrismaService) {}

  getQueue(status?: string) {
    return this.prisma.kitchenTicket.findMany({
      where: status ? { status: status as any } : { status: { in: ['QUEUED', 'PREPARING'] } },
      include: {
        order: {
          include: {
            items: { include: { item: true } },
            user: { select: { name: true, department: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async startTicket(id: string) {
    const t = await this.prisma.kitchenTicket.update({
      where: { id },
      data: { status: 'PREPARING', startedAt: new Date() },
    });
    await this.prisma.order.update({ where: { id: t.orderId }, data: { status: 'PREPARING' } });
    return t;
  }

  async doneTicket(id: string) {
    const t = await this.prisma.kitchenTicket.update({
      where: { id },
      data: { status: 'DONE', doneAt: new Date() },
    });
    await this.prisma.order.update({ where: { id: t.orderId }, data: { status: 'READY' } });
    return t;
  }

  async serveTicket(id: string) {
    const t = await this.prisma.kitchenTicket.update({
      where: { id },
      data: { status: 'SERVED' },
    });
    await this.prisma.order.update({ where: { id: t.orderId }, data: { status: 'COLLECTED' } });
    return t;
  }

  stats() {
    return this.prisma.kitchenTicket.groupBy({
      by: ['status'],
      _count: true,
    });
  }
}
