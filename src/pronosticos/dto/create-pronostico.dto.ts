import { IsInt, Min } from 'class-validator';

export class CreatePronosticoDto {
  @IsInt()
  partidoId: number;

  @IsInt()
  @Min(0)
  golesLocal: number;

  @IsInt()
  @Min(0)
  golesVisitante: number;
}
