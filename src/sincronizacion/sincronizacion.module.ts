import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Partido } from '../partidos/entities/partido.entity';
import { PronosticosModule } from '../pronosticos/pronosticos.module';
import { SincronizacionController } from './sincronizacion.controller';
import { SincronizacionService } from './sincronizacion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Partido]), AuthModule, PronosticosModule],
  controllers: [SincronizacionController],
  providers: [SincronizacionService],
})
export class SincronizacionModule {}
