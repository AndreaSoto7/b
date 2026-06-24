import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Funcion } from '../../funciones/entities/funcion.entity';
import { Reserva } from './reserva.entity';

@Entity('reserva_asientos')
@Unique('UQ_funcion_asiento', ['funcion', 'fila', 'columna'])
export class ReservaAsiento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reserva, (reserva) => reserva.asientos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  reserva: Reserva;

  @ManyToOne(() => Funcion, { nullable: false, onDelete: 'RESTRICT' })
  funcion: Funcion;

  @Column({ type: 'int' })
  fila: number;

  @Column({ type: 'int' })
  columna: number;
}
