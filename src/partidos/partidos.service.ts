import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { PronosticosService } from '../pronosticos/pronosticos.service';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdateResultadoDto } from './dto/update-resultado.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';
import { Partido, PartidoEstado } from './entities/partido.entity';
import { normalizePartidoPhase } from './phase.utils';

interface PartidoFilters {
  fase?: string;
  fecha?: string;
  estado?: string;
}

@Injectable()
export class PartidosService {
  constructor(
    @InjectRepository(Partido)
    private readonly repository: Repository<Partido>,
    private readonly pronosticosService: PronosticosService,
  ) {}

  async findAll(filters: PartidoFilters): Promise<Partido[]> {
    await this.normalizeExistingMatches();
    const where: Record<string, unknown> = {};
    if (filters.fase) where.fase = this.normalizePhaseParam(filters.fase);
    if (filters.estado) {
      where.estado = this.normalizeStatusParam(filters.estado);
    }
    if (filters.fecha) {
      const start = new Date(`${filters.fecha}T00:00:00`);
      const end = new Date(`${filters.fecha}T23:59:59.999`);
      if (Number.isNaN(start.getTime())) {
        throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
      }
      where.fechaHora = Between(start, end);
    }
    const partidos = await this.repository.find({
      where,
      order: { fechaHora: 'ASC' },
    });
    return this.normalizeAndPersistMatches(partidos);
  }

  async findOne(id: number): Promise<Partido> {
    const partido = await this.repository.findOneBy({ id });
    if (!partido) throw new NotFoundException('Partido no encontrado');
    const [normalized] = await this.normalizeAndPersistMatches([partido]);
    return normalized;
  }

  async findUpcoming(): Promise<Partido[]> {
    await this.normalizeExistingMatches();
    const partidos = await this.repository.find({
      where: {
        estado: PartidoEstado.PROGRAMADO,
        fechaHora: MoreThanOrEqual(new Date()),
      },
      order: { fechaHora: 'ASC' },
    });
    return this.normalizeAndPersistMatches(partidos);
  }

  async create(dto: CreatePartidoDto): Promise<Partido> {
    const partido = this.repository.create(this.toEntity(dto));
    partido.estado = this.resolveState(partido);
    return this.repository.save(partido);
  }

  async update(id: number, dto: UpdatePartidoDto): Promise<Partido> {
    const partido = await this.findOne(id);
    if (dto.golesLocal !== undefined || dto.golesVisitante !== undefined) {
      throw new BadRequestException(
        'El resultado se actualiza mediante sincronizacion externa',
      );
    }
    Object.assign(partido, this.toEntity(dto));
    partido.estado = this.resolveState(partido);
    return this.repository.save(partido);
  }

  async updateResult(id: number, dto: UpdateResultadoDto): Promise<Partido> {
    const partido = await this.findOne(id);
    partido.golesLocal = dto.golesLocal;
    partido.golesVisitante = dto.golesVisitante;
    partido.estado = dto.estado ?? PartidoEstado.FINALIZADO;
    const saved = await this.repository.save(partido);
    await this.pronosticosService.recalculateForMatch(saved.id);
    return saved;
  }

  async updateResultFromExternal(
    sportsDbEventId: string,
    golesLocal: number,
    golesVisitante: number,
    estado: PartidoEstado,
  ): Promise<Partido | null> {
    const partido = await this.repository.findOneBy({ sportsDbEventId });
    if (!partido) return null;
    partido.golesLocal = golesLocal;
    partido.golesVisitante = golesVisitante;
    partido.estado = estado;
    const saved = await this.repository.save(partido);
    await this.pronosticosService.recalculateForMatch(saved.id);
    return saved;
  }

  private normalizeStatusParam(value: string): PartidoEstado {
    const normalized = value.toLowerCase();
    const status = Object.values(PartidoEstado).find(
      (item) => item === normalized || item.toUpperCase() === value.toUpperCase(),
    );
    if (!status) throw new BadRequestException('Estado de partido invalido');
    return status;
  }

  private normalizePhaseParam(value: string): string {
    return normalizePartidoPhase(value);
  }

  private async normalizeAndPersistMatches(partidos: Partido[]): Promise<Partido[]> {
    const changed: Partido[] = [];
    for (const partido of partidos) {
      const nextState = this.resolveState(partido);
      const nextPhase = normalizePartidoPhase(partido.fase, partido.fechaHora);
      if (partido.estado !== nextState || partido.fase !== nextPhase) {
        partido.estado = nextState;
        partido.fase = nextPhase;
        changed.push(partido);
      }
    }
    if (changed.length) {
      await this.repository.save(changed);
      await Promise.all(
        changed
          .filter((partido) => partido.estado === PartidoEstado.FINALIZADO)
          .map((partido) => this.pronosticosService.recalculateForMatch(partido.id)),
      );
    }
    return partidos;
  }

  private async normalizeExistingMatches(): Promise<void> {
    const partidos = await this.repository.find();
    await this.normalizeAndPersistMatches(partidos);
  }

  private resolveState(partido: Partial<Partido>): PartidoEstado {
    const fechaHora = partido.fechaHora ? new Date(partido.fechaHora) : null;
    const hasScore = partido.golesLocal !== null && partido.golesLocal !== undefined &&
      partido.golesVisitante !== null && partido.golesVisitante !== undefined;
    const isPast = fechaHora ? fechaHora.getTime() <= Date.now() : false;
    const isFuture = fechaHora ? fechaHora.getTime() > Date.now() : false;
    if (partido.estado === PartidoEstado.EN_VIVO) return PartidoEstado.EN_VIVO;
    if (hasScore && isPast) return PartidoEstado.FINALIZADO;
    if (!hasScore && isFuture) return PartidoEstado.PROGRAMADO;
    return partido.estado ?? PartidoEstado.PROGRAMADO;
  }

  private toEntity(dto: CreatePartidoDto | UpdatePartidoDto): Partial<Partido> {
    return {
      ...dto,
      fechaHora: dto.fechaHora ? new Date(dto.fechaHora) : undefined,
    };
  }
}
