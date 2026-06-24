import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/User';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UsersService],
})
export class UsersModule {}
