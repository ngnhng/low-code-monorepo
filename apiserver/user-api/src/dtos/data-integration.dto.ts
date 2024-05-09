import { IsString } from 'class-validator';

export class CreateDataIntegrationDto {
  @IsString()
  name: string;

  @IsString()
  connectionType: string;

  connectionMetadata: unknown;

  @IsString()
  pid: string;
}

export class GetDataIntegrationDto {
  @IsString()
  pid: string;
}
