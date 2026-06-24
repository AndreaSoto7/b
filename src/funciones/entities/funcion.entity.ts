import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pelicula } from '../../peliculas/entities/pelicula.entity';
import { Reserva } from '../../reservas/entities/reserva.entity';
import { Sala } from '../../salas/entities/sala.entity';

@Entity('funciones')
export class Funcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pelicula, (pelicula) => pelicula.funciones, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  pelicula: Pelicula;

  @ManyToOne(() => Sala, (sala) => sala.funciones, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  sala: Sala;

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  precio: number;

  @OneToMany(() => Reserva, (reserva) => reserva.funcion)
  reservas: Reserva[];
}
