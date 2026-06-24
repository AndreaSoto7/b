import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { Sala } from './entities/sala.entity';

@Injectable()
export class SalasService {
  constructor(
    @InjectRepository(Sala) private readonly repository: Repository<Sala>,
  ) {}

  async findAll() {
    const salas = await this.repository.find({ order: { nombre: 'ASC' } });
    return salas.map((sala) => ({ ...sala, capacidad: sala.capacidad }));
  }

  async findOne(id: number): Promise<Sala> {
    const sala = await this.repository.findOneBy({ id });
    if (!sala) throw new NotFoundException('Sala no encontrada');
    return sala;
  }

  create(dto: CreateSalaDto): Promise<Sala> {
    return this.repository.save(this.repository.create(dto));
  }

  async update(id: number, dto: UpdateSalaDto): Promise<Sala> {
    const sala = await this.findOne(id);
    Object.assign(sala, dto);
    return this.repository.save(sala);
  }

  async remove(id: number): Promise<void> {
    const sala = await this.findOne(id);
    try {
      await this.repository.remove(sala);
    } catch {
      throw new ConflictException(
        'No se puede eliminar una sala que tiene funciones asociadas',
      );
    }
  }
}
