import { IsInt, Min } from 'class-validator';

export class UpdatePronosticoDto {
  @IsInt()
  @Min(0)
  golesLocal: number;

  @IsInt()
  @Min(0)
  golesVisitante: number;
}
