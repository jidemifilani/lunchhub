import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, department: true,
        walletBalance: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const u = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, phone: true,
        department: true, dietaryPrefs: true, walletBalance: true,
        isActive: true, createdAt: true },
    });
    if (!u) throw new NotFoundException('User not found.');
    return u;
  }

  async create(dto: any) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered.');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const { password, ...rest } = dto;
    return this.prisma.user.create({ data: { ...rest, passwordHash } });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    if (dto.password) {
      dto.passwordHash = await bcrypt.hash(dto.password, 12);
      delete dto.password;
    }
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  topUp(id: string, amount: number, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data: { walletBalance: { increment: amount } },
      });
      await tx.walletTransaction.create({
        data: { userId: id, type: 'TOPUP', amount, balAfter: u.walletBalance, note },
      });
      return u;
    });
  }
}
