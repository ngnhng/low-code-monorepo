import { IsString } from 'class-validator';

export class UserDTO {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;
}
