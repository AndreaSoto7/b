import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reserva } from '../../reservas/entities/reserva.entity';

export enum UserRole {
  CLIENTE = 'cliente',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fullName: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENTE })
  role: UserRole;

  @OneToMany(() => Reserva, (reserva) => reserva.usuario)
  reservas: Reserva[];
}
