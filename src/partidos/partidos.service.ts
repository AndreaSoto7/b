import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';
import { Partido, PartidoEstado } from './entities/partido.entity';

interface PartidoFilters {
  fase?: string;
  fecha?: string;
  estado?: PartidoEstado;
}

@Injectable()
export class PartidosService {
  constructor(
    @InjectRepository(Partido)
    private readonly repository: Repository<Partido>,
  ) {}

  findAll(filters: PartidoFilters): Promise<Partido[]> {
    const where: Record<string, unknown> = {};
    if (filters.fase) where.fase = filters.fase;
    if (filters.estado) where.estado = filters.estado;
    if (filters.fecha) {
      const start = new Date(`${filters.fecha}T00:00:00`);
      const end = new Date(`${filters.fecha}T23:59:59.999`);
      if (Number.isNaN(start.getTime())) {
        throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
      }
      where.fechaHora = Between(start, end);
    }
    return this.repository.find({
      where,
      order: { fechaHora: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Partido> {
    const partido = await this.repository.findOneBy({ id });
    if (!partido) throw new NotFoundException('Partido no encontrado');
    return partido;
  }

  create(dto: CreatePartidoDto): Promise<Partido> {
    return this.repository.save(this.repository.create(this.toEntity(dto)));
  }

  async update(id: number, dto: UpdatePartidoDto): Promise<Partido> {
    const partido = await this.findOne(id);
    if (dto.golesLocal !== undefined || dto.golesVisitante !== undefined) {
      throw new BadRequestException(
        'El resultado se actualiza mediante sincronizacion externa',
      );
    }
    Object.assign(partido, this.toEntity(dto));
    return this.repository.save(partido);
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
    return this.repository.save(partido);
  }

  private toEntity(dto: CreatePartidoDto | UpdatePartidoDto): Partial<Partido> {
    return {
      ...dto,
      fechaHora: dto.fechaHora ? new Date(dto.fechaHora) : undefined,
    };
  }
}
