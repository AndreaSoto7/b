import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { UserInfoDto } from '../auth/dto/userinfo-dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { ReservasService } from './reservas.service';

@Controller('reservas')
@UseGuards(AuthGuard)
export class ReservasController {
  constructor(private readonly service: ReservasService) {}

  @Post()
  create(@Req() request: Request, @Body() dto: CreateReservaDto) {
    const user = request['user'] as UserInfoDto;
    return this.service.create(user.id, dto);
  }

  @Get('mias')
  findMine(@Req() request: Request) {
    const user = request['user'] as UserInfoDto;
    return this.service.findMine(user.id);
  }
}

@Controller('funciones')
@UseGuards(AuthGuard)
export class AsientosController {
  constructor(private readonly service: ReservasService) {}

  @Get(':id/asientos')
  mapa(@Param('id', ParseIntPipe) id: number) {
    return this.service.mapaAsientos(id);
  }
}
