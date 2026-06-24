import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/User';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { PeliculasService } from './peliculas.service';

const uploadsPath = join(process.cwd(), 'uploads', 'posters');

interface UploadedPoster {
  filename: string;
}

const posterInterceptor = FileInterceptor('imagen', {
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      mkdirSync(uploadsPath, { recursive: true });
      callback(null, uploadsPath);
    },
    filename: (_req, file, callback) =>
      callback(
        null,
        `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
      ),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) =>
    callback(null, /^image\//.test(file.mimetype)),
});

@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly service: PeliculasService) {}

  @Get()
  findAll(@Query('buscar') buscar?: string, @Query('genero') genero?: string) {
    return this.service.findAll(buscar, genero);
  }

  @Get(':id/poster')
  async poster(@Param('id', ParseIntPipe) id: number) {
    const pelicula = await this.service.findEntity(id);
    const path = join(uploadsPath, pelicula.imagen);
    if (!existsSync(path))
      throw new BadRequestException('Imagen no disponible');
    return new StreamableFile(createReadStream(path));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(posterInterceptor)
  create(
    @Body() dto: CreatePeliculaDto,
    @UploadedFile() file?: UploadedPoster,
  ) {
    if (!file)
      throw new BadRequestException('La imagen del poster es obligatoria');
    return this.service.create(dto, file.filename);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(posterInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePeliculaDto,
    @UploadedFile() file?: UploadedPoster,
  ) {
    return this.service.update(id, dto, file?.filename);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
