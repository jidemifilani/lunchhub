import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  private nextNo() {
    return `DEL-${Date.now().toString(36).toUpperCase()}`;
  }

  getVendors() {
    return this.prisma.vendor.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  createVendor(dto: any) {
    return this.prisma.vendor.create({ data: dto });
  }

  findAll(status?: string) {
    return this.prisma.delivery.findMany({
      where: status ? { status: status as any } : {},
      include: { vendor: true, items: { include: { collections: true } } },
      orderBy: { expectedDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const d = await this.prisma.delivery.findUnique({
      where: { id },
      include: { vendor: true, items: { include: { collections: { include: { collector: { select: { name: true } } } } } } },
    });
    if (!d) throw new NotFoundException('Delivery not found.');
    return d;
  }

  create(dto: any) {
    const { items, ...rest } = dto;
    return this.prisma.delivery.create({
      data: {
        ...rest,
        deliveryNo: this.nextNo(),
        expectedDate: new Date(rest.expectedDate),
        items: { create: items },
      },
      include: { vendor: true, items: true },
    });
  }

  async receive(id: string, lines: { itemId: string; receivedQty: number }[]) {
    return this.prisma.$transaction(async (tx) => {
      for (const l of lines) {
        await tx.deliveryItem.update({ where: { id: l.itemId }, data: { receivedQty: l.receivedQty } });
      }
      const items = await tx.deliveryItem.findMany({ where: { deliveryId: id } });
      const allFull = items.every((i) => Number(i.receivedQty) >= Number(i.expectedQty));
      return tx.delivery.update({
        where: { id },
        data: { status: allFull ? 'RECEIVED' : 'PARTIAL', receivedAt: new Date() },
        include: { items: true },
      });
    });
  }

  collect(itemId: string, collectedBy: string, qty: number, purpose?: string) {
    return this.prisma.deliveryCollection.create({
      data: { itemId, collectedBy, qty, purpose },
      include: { collector: { select: { name: true } } },
    });
  }
}
