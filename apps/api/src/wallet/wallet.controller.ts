import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get()
  balance(@CurrentUser() u: any) { return this.wallet.getBalance(u.id); }

  @Get('history')
  history(@CurrentUser() u: any) { return this.wallet.getHistory(u.id); }

  @Post('top-up')
  topUp(@CurrentUser() u: any, @Body() dto: { amount: number; ref?: string }) {
    return this.wallet.topUp(u.id, Number(dto.amount), dto.ref);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Get('balances')
  allBalances() { return this.wallet.allBalances(); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post(':userId/adjust')
  adjust(@Param('userId') userId: string, @Body() dto: { amount: number; note: string }) {
    return this.wallet.adjust(userId, Number(dto.amount), dto.note);
  }
}
