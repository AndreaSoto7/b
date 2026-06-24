import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Funcion } from './entities/funcion.entity';
import { FuncionesController } from './funciones.controller';
import { FuncionesService } from './funciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Funcion]), AuthModule],
  controllers: [FuncionesController],
  providers: [FuncionesService],
  exports: [FuncionesService],
})
export class FuncionesModule {}
