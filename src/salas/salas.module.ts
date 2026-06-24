import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Sala } from './entities/sala.entity';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sala]), AuthModule],
  controllers: [SalasController],
  providers: [SalasService],
  exports: [SalasService],
})
export class SalasModule {}
