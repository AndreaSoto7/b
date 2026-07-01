import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GruposModule } from './grupos/grupos.module';
import { PartidosModule } from './partidos/partidos.module';
import { PronosticosModule } from './pronosticos/pronosticos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SincronizacionModule } from './sincronizacion/sincronizacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    GruposModule,
    PartidosModule,
    PronosticosModule,
    DashboardModule,
    SincronizacionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
