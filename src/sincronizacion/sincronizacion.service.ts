import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Partido, PartidoEstado } from '../partidos/entities/partido.entity';
import { PronosticosService } from '../pronosticos/pronosticos.service';

interface SportsDbEvent {
  idEvent?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strRound?: string;
  intRound?: string;
  strVenue?: string;
  strCity?: string;
  dateEvent?: string;
  strTime?: string;
  strTimestamp?: string;
  intHomeScore?: string;
  intAwayScore?: string;
  strStatus?: string;
}

@Injectable()
export class SincronizacionService implements OnModuleInit {
  private readonly logger = new Logger(SincronizacionService.name);

  constructor(
    @InjectRepository(Partido)
    private readonly partidosRepository: Repository<Partido>,
    private readonly pronosticosService: PronosticosService,
  ) {}

  onModuleInit(): void {
    const enabled = process.env.SPORTSDB_SYNC_ENABLED === 'true';
    if (!enabled) return;
    void this.syncSeasonMatches();
    void this.syncTodayResults();
    setInterval(
      () => void this.syncTodayResults(),
      Number(process.env.SPORTSDB_SYNC_INTERVAL_MS || 20 * 60 * 1000),
    );
  }

  async syncSeasonMatches() {
    const events = await this.fetchSeasonEvents();
    let created = 0;
    let updated = 0;
    for (const event of events) {
      if (!event.idEvent || !event.strHomeTeam || !event.strAwayTeam) continue;
      const fechaHora = this.resolveEventDate(event);
      if (!fechaHora) continue;
      const current = await this.partidosRepository.findOneBy({
        sportsDbEventId: event.idEvent,
      });
      const partido = current ?? this.partidosRepository.create();
      partido.sportsDbEventId = event.idEvent;
      partido.equipoLocal = event.strHomeTeam;
      partido.equipoVisitante = event.strAwayTeam;
      partido.fase = event.strRound || event.intRound || 'Mundial 2026';
      partido.estadio = event.strVenue || 'Por definir';
      partido.ciudad = event.strCity || 'Por definir';
      partido.fechaHora = fechaHora;
      partido.estado = this.mapStatus(event.strStatus);
      partido.golesLocal = this.parseScore(event.intHomeScore);
      partido.golesVisitante = this.parseScore(event.intAwayScore);
      const saved = await this.partidosRepository.save(partido);
      if (saved.estado === PartidoEstado.FINALIZADO) {
        await this.pronosticosService.recalculateForMatch(saved.id);
      }
      if (current) updated += 1;
      else created += 1;
    }
    this.logger.log(`Partidos importados: ${created}, actualizados: ${updated}`);
    return {
      created,
      updated,
      totalFromApi: events.length,
    };
  }

  async syncTodayResults() {
    const apiKey = process.env.SPORTSDB_API_KEY || '123';
    const url = process.env.SPORTSDB_EVENTS_DAY_URL;
    if (!url) {
      return {
        updated: 0,
        message: 'Configure SPORTSDB_EVENTS_DAY_URL para activar la sincronizacion',
      };
    }
    const response = await fetch(url.replace('{API_KEY}', apiKey));
    if (!response.ok) {
      throw new Error(`TheSportsDB respondio ${response.status}`);
    }
    const payload = (await response.json()) as { events?: SportsDbEvent[] };
    const events = payload.events ?? [];
    const todayMatches = await this.findTodayMatches();
    let updated = 0;
    for (const match of todayMatches) {
      if (!match.sportsDbEventId) continue;
      const event = events.find((item) => item.idEvent === match.sportsDbEventId);
      if (!event || event.intHomeScore === null || event.intAwayScore === null) {
        continue;
      }
      const golesLocal = Number(event.intHomeScore);
      const golesVisitante = Number(event.intAwayScore);
      if (Number.isNaN(golesLocal) || Number.isNaN(golesVisitante)) continue;
      match.golesLocal = golesLocal;
      match.golesVisitante = golesVisitante;
      match.estado = this.mapStatus(event.strStatus);
      await this.partidosRepository.save(match);
      await this.pronosticosService.recalculateForMatch(match.id);
      updated += 1;
    }
    this.logger.log(`Resultados sincronizados: ${updated}`);
    return { updated };
  }

  private async fetchSeasonEvents(): Promise<SportsDbEvent[]> {
    const apiKey = process.env.SPORTSDB_API_KEY || '123';
    const leagueId = process.env.SPORTSDB_WORLD_CUP_LEAGUE_ID || '4429';
    const season = process.env.SPORTSDB_WORLD_CUP_SEASON || '2026';
    const configuredUrl = process.env.SPORTSDB_EVENTS_SEASON_URL;
    const url =
      configuredUrl ||
      `https://www.thesportsdb.com/api/v1/json/{API_KEY}/eventsseason.php?id={LEAGUE_ID}&s={SEASON}`;
    const finalUrl = url
      .replace('{API_KEY}', apiKey)
      .replace('{LEAGUE_ID}', leagueId)
      .replace('{SEASON}', season);
    const response = await fetch(finalUrl);
    if (!response.ok) {
      throw new Error(`TheSportsDB respondio ${response.status}`);
    }
    const payload = (await response.json()) as { events?: SportsDbEvent[] };
    return payload.events ?? [];
  }

  private resolveEventDate(event: SportsDbEvent): Date | null {
    if (event.strTimestamp) return new Date(event.strTimestamp);
    if (!event.dateEvent) return null;
    const time = event.strTime || '00:00:00';
    return new Date(`${event.dateEvent}T${time.replace(' ', '')}`);
  }

  private parseScore(value?: string): number | null {
    if (value === undefined || value === null || value === '') return null;
    const score = Number(value);
    return Number.isNaN(score) ? null : score;
  }

  private findTodayMatches(): Promise<Partido[]> {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return this.partidosRepository.find({
      where: { fechaHora: Between(start, end) },
    });
  }

  private mapStatus(status?: string): PartidoEstado {
    if (status?.toLowerCase().includes('match finished')) {
      return PartidoEstado.FINALIZADO;
    }
    if (status?.toLowerCase().includes('in progress')) {
      return PartidoEstado.EN_VIVO;
    }
    return PartidoEstado.PROGRAMADO;
  }
}
