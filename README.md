# API de cartelera y reservas de cine

Backend NestJS + TypeORM/MySQL para administrar películas, salas, funciones y reservas de asientos.

## Puesta en marcha

1. Copiar `.env.example` a `.env` y completar la conexión MySQL y `JWT_SECRET`.
2. Instalar dependencias con `yarn install`.
3. Iniciar con `yarn start:dev`.

El backend no crea administradores al arrancar. El administrador debe existir previamente en la tabla `user` con el valor `admin` en la columna `role`. Los usuarios registrados desde la API siempre tienen el rol `cliente`.

## MySQL con Docker

El contenedor usado para el proyecto puede iniciarse con:

```bash
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=asfafsdfs123! -v mysql-data:/var/lib/mysql -p 3306:3306 -d mysql:latest
```

La configuración incluida en `.env.example` utiliza `localhost`, el puerto `3306`, el usuario `root` y esa contraseña. La base de datos `cine` debe existir dentro del contenedor antes de iniciar NestJS. Si el volumen aún no la contiene, puede crearse con:

```bash
docker exec mysql-container mysql -uroot -pasfafsdfs123! -e "CREATE DATABASE IF NOT EXISTS cine;"
```

## Endpoints

### Autenticación

- `POST /auth/register`: registro de cliente.
- `POST /auth/login`: devuelve el token JWT.
- `POST /auth/logout`: cierre de sesión del cliente (debe descartarse el token).
- `GET /auth/me`: perfil del usuario autenticado.

### Cartelera pública

- `GET /peliculas`: lista la cartelera. Acepta `?buscar=texto&genero=genero`.
- `GET /peliculas/:id`: detalle, sala y próximas funciones.
- `GET /peliculas/:id/poster`: archivo del poster.
- `GET /funciones`: lista funciones; acepta `?peliculaId=1`.
- `GET /funciones/:id`: detalle de una función.

### Administración

Requieren `Authorization: Bearer <token>` de un administrador.

- `POST /peliculas`, `PATCH /peliculas/:id`, `DELETE /peliculas/:id`. El alta/edición usa `multipart/form-data`; el archivo se envía en `imagen`.
- `GET /salas`, `GET /salas/:id`, `POST /salas`, `PATCH /salas/:id`, `DELETE /salas/:id`.
- `POST /funciones`, `PATCH /funciones/:id`, `DELETE /funciones/:id`.

El sistema bloquea funciones superpuestas en una misma sala usando la fecha/hora y la duración de cada película.

### Reservas

Requieren un usuario autenticado.

- `GET /funciones/:id/asientos`: mapa gráfico consumible por el frontend (`disponible`/`ocupado`).
- `POST /reservas`: confirma uno o varios asientos.
- `GET /reservas/mias`: historial del usuario.

Ejemplo de reserva:

```json
{
  "funcionId": 1,
  "asientos": [
    { "fila": 1, "columna": 2 },
    { "fila": 1, "columna": 3 }
  ]
}
```

La confirmación se realiza en una transacción y existe una restricción única por función/fila/columna, por lo que un asiento no puede venderse dos veces aun con solicitudes concurrentes.
