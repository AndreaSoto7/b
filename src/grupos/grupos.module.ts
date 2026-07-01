import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Partido } from '../partidos/entities/partido.entity';
import { Pronostico } from '../pronosticos/entities/pronostico.entity';
import { User } from '../users/entities/User';
import { GrupoMiembro } from './entities/grupo-miembro.entity';
import { Grupo } from './entities/grupo.entity';
import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grupo, GrupoMiembro, User, Pronostico, Partido]),
    AuthModule,
  ],
  controllers: [GruposController],
  providers: [GruposService],
  exports: [GruposService, TypeOrmModule],
})
export class GruposModule {}
