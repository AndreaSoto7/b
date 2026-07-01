import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGrupoDto {
  @IsNotEmpty()
  @MaxLength(80)
  nombre: string;
}
