import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { Pelicula } from './entities/pelicula.entity';

@Injectable()
export class PeliculasService {
  constructor(
    @InjectRepository(Pelicula)
    private readonly repository: Repository<Pelicula>,
  ) {}

  findAll(buscar?: string, genero?: string): Promise<Pelicula[]> {
    return this.repository.find({
      where: {
        ...(buscar ? { titulo: ILike(`%${buscar}%`) } : {}),
        ...(genero ? { genero } : {}),
      },
      order: { titulo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Pelicula> {
    const pelicula = await this.repository.findOne({
      where: { id },
      relations: { funciones: { sala: true } },
      order: { funciones: { fechaHora: 'ASC' } },
    });
    if (!pelicula) throw new NotFoundException('Película no encontrada');
    pelicula.funciones = pelicula.funciones.filter(
      (funcion) => new Date(funcion.fechaHora) >= new Date(),
    );
    return pelicula;
  }

  create(dto: CreatePeliculaDto, imagen: string): Promise<Pelicula> {
    return this.repository.save(this.repository.create({ ...dto, imagen }));
  }

  async update(
    id: number,
    dto: UpdatePeliculaDto,
    imagen?: string,
  ): Promise<Pelicula> {
    const pelicula = await this.findEntity(id);
    Object.assign(pelicula, dto, imagen ? { imagen } : {});
    return this.repository.save(pelicula);
  }

  async remove(id: number): Promise<void> {
    const pelicula = await this.findEntity(id);
    try {
      await this.repository.remove(pelicula);
    } catch {
      throw new ConflictException(
        'No se puede eliminar una película que tiene funciones asociadas',
      );
    }
  }

  async findEntity(id: number): Promise<Pelicula> {
    const pelicula = await this.repository.findOneBy({ id });
    if (!pelicula) throw new NotFoundException('Película no encontrada');
    return pelicula;
  }
}
