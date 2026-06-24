import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Funcion } from '../../funciones/entities/funcion.entity';

export enum Clasificacion {
  MAS_14 = '+14',
  R = 'R',
  TODO_PUBLICO = 'Todo público',
}

@Entity('peliculas')
export class Pelicula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  titulo: string;

  @Column({ type: 'text' })
  sinopsis: string;

  @Column()
  genero: string;

  @Column({ type: 'int', comment: 'Duración en minutos' })
  duracion: number;

  @Column({ type: 'enum', enum: Clasificacion })
  clasificacion: Clasificacion;

  @Column()
  imagen: string;

  @OneToMany(() => Funcion, (funcion) => funcion.pelicula)
  funciones: Funcion[];
}
