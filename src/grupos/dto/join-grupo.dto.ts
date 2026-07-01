import { IsNotEmpty } from 'class-validator';

export class JoinGrupoDto {
  @IsNotEmpty()
  codigoInvitacion: string;
}
