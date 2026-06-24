import { UserRole } from '../../users/entities/User';

export class UserRegisterResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}
