import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ReservaAsiento } from './entities/reserva-asiento.entity';
import { Reserva } from './entities/reserva.entity';
import { AsientosController, ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, ReservaAsiento]), AuthModule],
  controllers: [ReservasController, AsientosController],
  providers: [ReservasService],
})
export class ReservasModule {}
