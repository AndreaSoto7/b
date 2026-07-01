import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/User';
import { Grupo } from './grupo.entity';

@Entity()
@Unique(['grupo', 'usuario'])
export class GrupoMiembro {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Grupo, (grupo) => grupo.miembros, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  grupo: Grupo;

  @ManyToOne(() => User, (usuario) => usuario.membresias, {
    nullable: false,
  })
  usuario: User;

  @CreateDateColumn()
  unidoEn: Date;
}
