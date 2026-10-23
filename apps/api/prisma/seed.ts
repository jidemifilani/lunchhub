import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lunchhub.test' },
    update: {},
    create: { name: 'Admin User', email: 'admin@lunchhub.test', passwordHash: await hash('Admin@2026'), role: 'ADMIN', walletBalance: 5000 },
  });
  const chef = await prisma.user.upsert({
    where: { email: 'chef@lunchhub.test' },
    update: {},
    create: { name: 'Kitchen Staff', email: 'chef@lunchhub.test', passwordHash: await hash('Kitchen@2026'), role: 'KITCHEN_STAFF', walletBalance: 0 },
  });
  const staff = await prisma.user.upsert({
    where: { email: 'staff@lunchhub.test' },
    update: {},
    create: { name: 'Jane Doe', email: 'staff@lunchhub.test', passwordHash: await hash('Staff@2026'), role: 'STAFF', department: 'Finance', walletBalance: 2500 },
  });

  // Categories
  const cats = await Promise.all([
    prisma.menuCategory.upsert({ where: { id: 'cat-mains' }, update: {}, create: { id: 'cat-mains', name: 'Mains', sortOrder: 1 } }),
    prisma.menuCategory.upsert({ where: { id: 'cat-sides' }, update: {}, create: { id: 'cat-sides', name: 'Sides', sortOrder: 2 } }),
    prisma.menuCategory.upsert({ where: { id: 'cat-drinks' }, update: {}, create: { id: 'cat-drinks', name: 'Drinks', sortOrder: 3 } }),
    prisma.menuCategory.upsert({ where: { id: 'cat-snacks' }, update: {}, create: { id: 'cat-snacks', name: 'Snacks', sortOrder: 4 } }),
  ]);

  // Menu items
  const items = [
    { id: 'item-jollof', name: 'Jollof Rice & Chicken', price: 1200, categoryId: 'cat-mains', calories: 650, protein: 38, carbs: 72, fat: 18, prepMins: 20 },
    { id: 'item-fried', name: 'Fried Rice & Fish', price: 1100, categoryId: 'cat-mains', calories: 600, protein: 32, carbs: 68, fat: 16, prepMins: 20 },
    { id: 'item-egusi', name: 'Egusi Soup & Pounded Yam', price: 1400, categoryId: 'cat-mains', calories: 720, protein: 28, carbs: 82, fat: 24, prepMins: 25 },
    { id: 'item-salad', name: 'Garden Salad', price: 500, categoryId: 'cat-sides', calories: 120, protein: 4, carbs: 14, fat: 6, prepMins: 5 },
    { id: 'item-coleslaw', name: 'Coleslaw', price: 400, categoryId: 'cat-sides', calories: 180, protein: 2, carbs: 18, fat: 10, prepMins: 5 },
    { id: 'item-water', name: 'Bottled Water', price: 150, categoryId: 'cat-drinks', calories: 0, prepMins: 1 },
    { id: 'item-zobo', name: 'Zobo Drink', price: 300, categoryId: 'cat-drinks', calories: 45, prepMins: 1 },
    { id: 'item-puff', name: 'Puff Puff (5pcs)', price: 350, categoryId: 'cat-snacks', calories: 280, prepMins: 3 },
  ];

  for (const item of items) {
    await prisma.menuItem.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // Vendor
  const vendor = await prisma.vendor.upsert({
    where: { id: 'v-freshfarm' },
    update: {},
    create: { id: 'v-freshfarm', name: 'FreshFarm Supplies', contact: 'Emeka Obi', phone: '08012345678', email: 'freshfarm@example.ng' },
  });

  console.log('Seed complete. Demo logins:');
  console.log('  admin@lunchhub.test / Admin@2026');
  console.log('  chef@lunchhub.test  / Kitchen@2026');
  console.log('  staff@lunchhub.test / Staff@2026');
}

main().catch(console.error).finally(() => prisma.$disconnect());
