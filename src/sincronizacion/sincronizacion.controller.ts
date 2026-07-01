import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/User';
import { SincronizacionService } from './sincronizacion.service';

@Controller('sincronizacion')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SincronizacionController {
  constructor(private readonly service: SincronizacionService) {}

  @Post('resultados')
  syncNow() {
    return this.service.syncTodayResults();
  }

  @Post('partidos')
  syncMatches() {
    return this.service.syncSeasonMatches();
  }
}
