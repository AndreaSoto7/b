import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Pronostico } from '../../pronosticos/entities/pronostico.entity';

export enum PartidoEstado {
  PROGRAMADO = 'programado',
  EN_VIVO = 'en_vivo',
  FINALIZADO = 'finalizado',
}

@Entity()
export class Partido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  equipoLocal: string;

  @Column()
  equipoVisitante: string;

  @Column()
  fase: string;

  @Column()
  estadio: string;

  @Column()
  ciudad: string;

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ type: 'enum', enum: PartidoEstado, default: PartidoEstado.PROGRAMADO })
  estado: PartidoEstado;

  @Column({ type: 'int', nullable: true })
  golesLocal: number | null;

  @Column({ type: 'int', nullable: true })
  golesVisitante: number | null;

  @Column({ type: 'varchar', length: 80, nullable: true, unique: true })
  sportsDbEventId: string | null;

  @OneToMany(() => Pronostico, (pronostico) => pronostico.partido)
  pronosticos: Pronostico[];
}
