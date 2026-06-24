import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Pelicula } from './entities/pelicula.entity';
import { PeliculasController } from './peliculas.controller';
import { PeliculasService } from './peliculas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pelicula]), AuthModule],
  controllers: [PeliculasController],
  providers: [PeliculasService],
  exports: [PeliculasService],
})
export class PeliculasModule {}
