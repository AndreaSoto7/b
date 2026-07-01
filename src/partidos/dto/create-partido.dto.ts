import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { PartidoEstado } from '../entities/partido.entity';

export class CreatePartidoDto {
  @IsNotEmpty()
  equipoLocal: string;

  @IsNotEmpty()
  equipoVisitante: string;

  @IsNotEmpty()
  fase: string;

  @IsNotEmpty()
  estadio: string;

  @IsNotEmpty()
  ciudad: string;

  @IsDateString()
  fechaHora: string;

  @IsOptional()
  @IsEnum(PartidoEstado)
  estado?: PartidoEstado;

  @IsOptional()
  @IsInt()
  @Min(0)
  golesLocal?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  golesVisitante?: number;

  @IsOptional()
  sportsDbEventId?: string;
}
