import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { UserInfoDto } from '../auth/dto/userinfo-dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  summary(@Req() request: Request) {
    const user = request['user'] as UserInfoDto;
    return this.service.summary(user.id);
  }
}
