import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateSalaDto {
  @IsNotEmpty()
  nombre: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  filas: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  columnas: number;
}
