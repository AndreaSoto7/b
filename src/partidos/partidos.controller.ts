import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/User';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdateResultadoDto } from './dto/update-resultado.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';
import { PartidosService } from './partidos.service';

@Controller('partidos')
export class PartidosController {
  constructor(private readonly service: PartidosService) {}

  @Get()
  findAll(
    @Query('fase') fase?: string,
    @Query('fecha') fecha?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.findAll({ fase, fecha, estado });
  }

  @Get('proximos')
  findUpcoming() {
    return this.service.findUpcoming();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePartidoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartidoDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/resultado')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResultadoDto,
  ) {
    return this.service.updateResult(id, dto);
  }
}
