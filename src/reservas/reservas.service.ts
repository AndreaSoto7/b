import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Funcion } from '../funciones/entities/funcion.entity';
import { User } from '../users/entities/User';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { ReservaAsiento } from './entities/reserva-asiento.entity';
import { Reserva } from './entities/reserva.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
    @InjectRepository(ReservaAsiento)
    private readonly asientosRepository: Repository<ReservaAsiento>,
    private readonly dataSource: DataSource,
  ) {}

  async mapaAsientos(funcionId: number) {
    const funcion = await this.dataSource.getRepository(Funcion).findOne({
      where: { id: funcionId },
      relations: { sala: true },
    });
    if (!funcion) throw new NotFoundException('Función no encontrada');
    const ocupados = await this.asientosRepository.find({
      where: { funcion: { id: funcionId } },
    });
    const clavesOcupadas = new Set(
      ocupados.map((asiento) => `${asiento.fila}-${asiento.columna}`),
    );
    const asientos = Array.from({ length: funcion.sala.filas }, (_, fila) =>
      Array.from({ length: funcion.sala.columnas }, (_, columna) => ({
        fila: fila + 1,
        columna: columna + 1,
        estado: clavesOcupadas.has(`${fila + 1}-${columna + 1}`)
          ? 'ocupado'
          : 'disponible',
      })),
    );
    return {
      funcionId,
      sala: funcion.sala.nombre,
      filas: funcion.sala.filas,
      columnas: funcion.sala.columnas,
      asientos,
    };
  }

  async create(usuarioId: number, dto: CreateReservaDto): Promise<Reserva> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const funcion = await manager.findOne(Funcion, {
          where: { id: dto.funcionId },
          relations: { sala: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!funcion) throw new NotFoundException('Función no encontrada');
        if (new Date(funcion.fechaHora) <= new Date()) {
          throw new BadRequestException(
            'No se puede reservar una función que ya comenzó',
          );
        }
        const usuario = await manager.findOneBy(User, { id: usuarioId });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const claves = dto.asientos.map(
          (asiento) => `${asiento.fila}-${asiento.columna}`,
        );
        if (new Set(claves).size !== claves.length) {
          throw new BadRequestException(
            'Hay asientos repetidos en la solicitud',
          );
        }
        const fueraDeRango = dto.asientos.some(
          (asiento) =>
            asiento.fila > funcion.sala.filas ||
            asiento.columna > funcion.sala.columnas,
        );
        if (fueraDeRango) {
          throw new BadRequestException(
            'Uno o más asientos no existen en la sala',
          );
        }

        const ocupados = await manager.find(ReservaAsiento, {
          where: { funcion: { id: funcion.id } },
        });
        const clavesOcupadas = new Set(
          ocupados.map((a) => `${a.fila}-${a.columna}`),
        );
        if (claves.some((clave) => clavesOcupadas.has(clave))) {
          throw new ConflictException(
            'Uno o más asientos ya están reservados para esta función',
          );
        }

        const reserva = await manager.save(
          manager.create(Reserva, {
            usuario,
            funcion,
            total: Number(funcion.precio) * dto.asientos.length,
            estado: 'confirmada',
          }),
        );
        reserva.asientos = await manager.save(
          ReservaAsiento,
          dto.asientos.map((asiento) =>
            manager.create(ReservaAsiento, {
              ...asiento,
              reserva,
              funcion,
            }),
          ),
        );
        return reserva;
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new ConflictException(
        'Uno o más asientos ya fueron reservados por otro usuario',
      );
    }
  }

  findMine(usuarioId: number): Promise<Reserva[]> {
    return this.reservasRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: {
        funcion: { pelicula: true, sala: true },
        asientos: true,
      },
      order: { creadaEn: 'DESC' },
    });
  }
}
