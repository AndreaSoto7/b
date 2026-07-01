import { IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  fullName: string;
}
