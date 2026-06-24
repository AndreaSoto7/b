import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Funcion } from '../../funciones/entities/funcion.entity';
import { User } from '../../users/entities/User';
import { ReservaAsiento } from './reserva-asiento.entity';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (usuario) => usuario.reservas, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  usuario: User;

  @ManyToOne(() => Funcion, (funcion) => funcion.reservas, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  funcion: Funcion;

  @Column({ default: 'confirmada' })
  estado: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  total: number;

  @CreateDateColumn()
  creadaEn: Date;

  @OneToMany(() => ReservaAsiento, (asiento) => asiento.reserva, {
    cascade: true,
  })
  asientos: ReservaAsiento[];
}
