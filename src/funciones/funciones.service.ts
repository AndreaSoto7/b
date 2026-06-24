import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Pelicula } from '../peliculas/entities/pelicula.entity';
import { Sala } from '../salas/entities/sala.entity';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';
import { Funcion } from './entities/funcion.entity';

@Injectable()
export class FuncionesService {
  constructor(
    @InjectRepository(Funcion)
    private readonly repository: Repository<Funcion>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(peliculaId?: number): Promise<Funcion[]> {
    return this.repository.find({
      where: peliculaId ? { pelicula: { id: peliculaId } } : {},
      relations: { pelicula: true, sala: true },
      order: { fechaHora: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Funcion> {
    const funcion = await this.repository.findOne({
      where: { id },
      relations: { pelicula: true, sala: true },
    });
    if (!funcion) throw new NotFoundException('Función no encontrada');
    return funcion;
  }

  create(dto: CreateFuncionDto): Promise<Funcion> {
    return this.dataSource.transaction((manager) => this.save(manager, dto));
  }

  update(id: number, dto: UpdateFuncionDto): Promise<Funcion> {
    return this.dataSource.transaction((manager) =>
      this.save(manager, dto, id),
    );
  }

  async remove(id: number): Promise<void> {
    const funcion = await this.findOne(id);
    try {
      await this.repository.remove(funcion);
    } catch {
      throw new ConflictException(
        'No se puede eliminar una función con reservas asociadas',
      );
    }
  }

  private async save(
    manager: EntityManager,
    dto: CreateFuncionDto | UpdateFuncionDto,
    id?: number,
  ): Promise<Funcion> {
    const current = id
      ? await manager.findOne(Funcion, {
          where: { id },
          relations: { pelicula: true, sala: true },
        })
      : null;
    if (id && !current) throw new NotFoundException('Función no encontrada');

    const peliculaId = dto.peliculaId ?? current?.pelicula.id;
    const salaId = dto.salaId ?? current?.sala.id;
    const pelicula = await manager.findOneBy(Pelicula, { id: peliculaId });
    if (!pelicula) throw new NotFoundException('Película no encontrada');

    const sala = await manager.findOne(Sala, {
      where: { id: salaId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!sala) throw new NotFoundException('Sala no encontrada');

    const fechaHora = dto.fechaHora
      ? new Date(dto.fechaHora)
      : new Date(current!.fechaHora);
    const funciones = await manager.find(Funcion, {
      where: { sala: { id: sala.id } },
      relations: { pelicula: true },
    });
    const inicio = fechaHora.getTime();
    const fin = inicio + pelicula.duracion * 60_000;
    const superpuesta = funciones.some((funcion) => {
      if (funcion.id === id) return false;
      const otroInicio = new Date(funcion.fechaHora).getTime();
      const otroFin = otroInicio + funcion.pelicula.duracion * 60_000;
      return inicio < otroFin && fin > otroInicio;
    });
    if (superpuesta) {
      throw new ConflictException(
        'La sala ya está ocupada por otra función en ese horario',
      );
    }

    const funcion = current ?? manager.create(Funcion);
    Object.assign(funcion, {
      pelicula,
      sala,
      fechaHora,
      precio: dto.precio ?? current?.precio,
    });
    return manager.save(funcion);
  }
}
