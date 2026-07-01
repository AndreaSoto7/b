import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { GrupoMiembro } from '../grupos/entities/grupo-miembro.entity';
import { Partido, PartidoEstado } from '../partidos/entities/partido.entity';
import { Pronostico } from '../pronosticos/entities/pronostico.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(GrupoMiembro)
    private readonly miembrosRepository: Repository<GrupoMiembro>,
    @InjectRepository(Partido)
    private readonly partidosRepository: Repository<Partido>,
    @InjectRepository(Pronostico)
    private readonly pronosticosRepository: Repository<Pronostico>,
  ) {}

  async summary(usuarioId: number) {
    const grupos = await this.miembrosRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: { grupo: true },
    });
    const pronosticos = await this.pronosticosRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: { partido: true },
    });
    const pronosticadosIds = new Set(
      pronosticos.map((pronostico) => pronostico.partido.id),
    );
    const proximosPartidos = await this.partidosRepository.find({
      where: {
        estado: PartidoEstado.PROGRAMADO,
        fechaHora: MoreThan(new Date()),
      },
      order: { fechaHora: 'ASC' },
      take: 10,
    });
    return {
      cantidadGrupos: grupos.length,
      puntajeAcumulado: pronosticos.reduce(
        (total, pronostico) => total + pronostico.puntos,
        0,
      ),
      proximosPartidosPendientes: proximosPartidos.filter(
        (partido) => !pronosticadosIds.has(partido.id),
      ),
      grupos: grupos.map((miembro) => ({
        id: miembro.grupo.id,
        nombre: miembro.grupo.nombre,
      })),
    };
  }
}
