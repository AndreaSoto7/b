import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Funcion } from '../../funciones/entities/funcion.entity';

@Entity('salas')
export class Sala {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ type: 'int' })
  filas: number;

  @Column({ type: 'int' })
  columnas: number;

  @OneToMany(() => Funcion, (funcion) => funcion.sala)
  funciones: Funcion[];

  get capacidad(): number {
    return this.filas * this.columnas;
  }
}
