import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { GrupoMiembro } from '../grupos/entities/grupo-miembro.entity';
import { Partido } from '../partidos/entities/partido.entity';
import { Pronostico } from '../pronosticos/entities/pronostico.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GrupoMiembro, Partido, Pronostico]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
