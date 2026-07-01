# API Quiniela Mundial 2026

Backend NestJS + TypeORM/MySQL para una quiniela del Mundial 2026 con usuarios, grupos, partidos, pronosticos, clasificacion y dashboard.

## Puesta en marcha

1. Copiar `.env.example` a `.env` y completar la conexion MySQL y `JWT_SECRET`.
2. Instalar dependencias con `yarn install` o `npm install`.
3. Iniciar con `yarn start:dev` o `npm run start:dev`.

El backend no crea administradores al arrancar. El administrador debe existir previamente en la tabla `user` con el valor `admin` en la columna `role`. Los usuarios registrados desde la API tienen el rol `usuario`.

## MySQL con Docker

El contenedor usado para el proyecto puede iniciarse con:

```bash
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=asfafsdfs123! -v mysql-data:/var/lib/mysql -p 3306:3306 -d mysql:latest
```

La configuracion incluida en `.env.example` utiliza `localhost`, puerto `3306`, usuario `root` y esa contrasena. La base de datos `quiniela_mundial` debe existir dentro del contenedor antes de iniciar NestJS:

```bash
docker exec mysql-container mysql -uroot -pasfafsdfs123! -e "CREATE DATABASE IF NOT EXISTS quiniela_mundial;"
```

## Endpoints

### Autenticacion y perfil

- `POST /auth/register`: registra un usuario con nombre, correo y contrasena.
- `POST /auth/login`: devuelve token JWT.
- `POST /auth/logout`: cierre de sesion logico del cliente.
- `GET /auth/me`: perfil del usuario autenticado.
- `PATCH /auth/me`: modifica el nombre del usuario autenticado.

### Grupos

Requieren `Authorization: Bearer <token>`.

- `POST /grupos`: crea un grupo e incorpora al creador.
- `GET /grupos`: lista los grupos del usuario.
- `GET /grupos/:id/invitacion`: devuelve el codigo de invitacion del grupo creado.
- `POST /grupos/unirse`: une al usuario a un grupo mediante codigo.
- `GET /grupos/:id/participantes`: lista participantes.
- `GET /grupos/:id/clasificacion`: muestra ranking por puntos.

### Partidos

- `GET /partidos`: calendario completo. Acepta `?fase=grupos&fecha=2026-06-11&estado=programado`.
- `GET /partidos/:id`: detalle del partido, estadio y ciudad.

Requieren token de administrador:

- `POST /partidos`: registra un partido.
- `PATCH /partidos/:id`: modifica informacion del partido. El resultado no puede editarse manualmente; se actualiza por sincronizacion externa.

### Pronosticos

Requieren token de usuario.

- `POST /pronosticos`: registra un pronostico antes del inicio del partido.
- `PATCH /pronosticos/:id`: modifica un pronostico mientras el partido no haya comenzado.
- `GET /pronosticos/mios`: lista pronosticos del usuario y puntos obtenidos.
- `GET /pronosticos/posicion/:grupoId`: devuelve la posicion del usuario dentro de un grupo.

Ejemplo:

```json
{
  "partidoId": 1,
  "golesLocal": 2,
  "golesVisitante": 1
}
```

Reglas de puntos actuales:

- Marcador exacto: 3 puntos.
- Ganador o empate acertado sin marcador exacto: 1 punto.
- Resultado incorrecto: 0 puntos.

### Dashboard

- `GET /dashboard`: resumen del usuario con cantidad de grupos, puntaje acumulado, grupos y proximos partidos pendientes de pronostico.

### Sincronizacion de resultados

Requiere token de administrador.

- `POST /sincronizacion/resultados`: ejecuta la sincronizacion manual de resultados del dia.
- `POST /sincronizacion/partidos`: importa o actualiza el calendario desde TheSportsDB.

La sincronizacion automatica queda desactivada por defecto. Para activarla:

```env
SPORTSDB_SYNC_ENABLED=true
SPORTSDB_SYNC_INTERVAL_MS=1200000
SPORTSDB_API_KEY=123
SPORTSDB_WORLD_CUP_LEAGUE_ID=4429
SPORTSDB_WORLD_CUP_SEASON=2026
SPORTSDB_EVENTS_SEASON_URL=
SPORTSDB_EVENTS_DAY_URL=https://www.thesportsdb.com/api/v1/json/{API_KEY}/eventsday.php?d=2026-06-11&s=Soccer
```

Cada partido puede guardar `sportsDbEventId`; con ese identificador se cruza contra TheSportsDB y se recalculan los puntos de los pronosticos afectados.
