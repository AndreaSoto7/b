import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Partido } from '../../partidos/entities/partido.entity';
import { User } from '../../users/entities/User';

@Entity()
@Unique(['usuario', 'partido'])
export class Pronostico {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (usuario) => usuario.pronosticos, {
    nullable: false,
  })
  usuario: User;

  @ManyToOne(() => Partido, (partido) => partido.pronosticos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  partido: Partido;

  @Column({ type: 'int' })
  golesLocal: number;

  @Column({ type: 'int' })
  golesVisitante: number;

  @Column({ type: 'int', default: 0 })
  puntos: number;
}
