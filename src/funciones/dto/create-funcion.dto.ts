import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsNumber, Min } from 'class-validator';

export class CreateFuncionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  peliculaId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  salaId: number;

  @IsISO8601()
  fechaHora: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio: number;
}
