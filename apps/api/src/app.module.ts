import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { PlannerModule } from './planner/planner.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    MenuModule,
    OrdersModule,
    KitchenModule,
    PlannerModule,
    DeliveriesModule,
    WalletModule,
  ],
})
export class AppModule {}
