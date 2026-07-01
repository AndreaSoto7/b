import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/User';
import { GrupoMiembro } from './grupo-miembro.entity';

@Entity()
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  codigoInvitacion: string;

  @ManyToOne(() => User, (usuario) => usuario.gruposCreados, {
    nullable: false,
  })
  creador: User;

  @OneToMany(() => GrupoMiembro, (miembro) => miembro.grupo)
  miembros: GrupoMiembro[];

  @CreateDateColumn()
  creadoEn: Date;
}
