import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Clasificacion } from '../entities/pelicula.entity';

export class CreatePeliculaDto {
  @IsNotEmpty()
  titulo: string;

  @IsNotEmpty()
  sinopsis: string;

  @IsNotEmpty()
  genero: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duracion: number;

  @IsEnum(Clasificacion)
  clasificacion: Clasificacion;
}
