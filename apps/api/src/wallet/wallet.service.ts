import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  getBalance(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
  }

  getHistory(userId: string) {
    return this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async topUp(userId: string, amount: number, ref?: string) {
    const u = await this.prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amount } },
    });
    return this.prisma.walletTransaction.create({
      data: { userId, type: 'TOPUP', amount, balAfter: u.walletBalance, ref },
    });
  }

  async adjust(userId: string, amount: number, note: string) {
    const u = await this.prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amount } },
    });
    return this.prisma.walletTransaction.create({
      data: { userId, type: 'ADJUSTMENT', amount, balAfter: u.walletBalance, note },
    });
  }

  allBalances() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, department: true, walletBalance: true },
      orderBy: { walletBalance: 'desc' },
    });
  }
}
