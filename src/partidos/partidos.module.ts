import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Partido } from './entities/partido.entity';
import { PartidosController } from './partidos.controller';
import { PartidosService } from './partidos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Partido]), AuthModule],
  controllers: [PartidosController],
  providers: [PartidosService],
  exports: [PartidosService, TypeOrmModule],
})
export class PartidosModule {}
