import { IsString } from 'class-validator';

export class CreateProjectDTO {
  @IsString()
  title: string;
}
