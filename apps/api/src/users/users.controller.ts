import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Get()
  findAll() { return this.users.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.users.findOne(id); }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: any) { return this.users.create(dto); }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.users.update(id, dto); }

  @Roles('ADMIN', 'CANTEEN_STAFF')
  @Post(':id/top-up')
  topUp(@Param('id') id: string, @Body() dto: any) {
    return this.users.topUp(id, Number(dto.amount), dto.note);
  }
}
