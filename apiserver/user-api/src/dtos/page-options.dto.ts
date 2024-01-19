import { ORDER, OrderType } from '@constants/response.constant';
import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';

export class PageOptionsDto {
  @IsEnum(ORDER)
  readonly order: OrderType = ORDER.ASC;

  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @IsInt()
  @Min(1)
  @Max(50)
  readonly take: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  @IsString({
    each: true,
  })
  readonly q?: string;
}
