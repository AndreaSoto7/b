import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class AsientoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fila: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  columna: number;
}

export class CreateReservaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  funcionId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AsientoDto)
  asientos: AsientoDto[];
}
