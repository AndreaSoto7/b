import { UserRole } from '../../users/entities/User';

export class UserInfoDto {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}
