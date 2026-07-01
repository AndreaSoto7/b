import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }
  createUser(email: string, password: string, fullName: string): Promise<User> {
    const user = this.repository.create({
      email: email.toLowerCase(),
      password,
      fullName,
      role: UserRole.USUARIO,
    });
    return this.repository.save(user);
  }
  getUserById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async updateProfile(id: number, fullName: string): Promise<User> {
    const user = await this.repository.findOneOrFail({ where: { id } });
    user.fullName = fullName;
    return this.repository.save(user);
  }
}
