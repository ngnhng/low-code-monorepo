import { IsString } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  title: string;

  @IsString()
  wfData: string;

  @IsString()
  pid: string;
}
