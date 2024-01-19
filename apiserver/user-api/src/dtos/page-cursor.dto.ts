import { ORDER, OrderType, PAGING_LIMIT } from '@constants/response.constant';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PageCursorDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly cursor: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  readonly take: number = PAGING_LIMIT;

  @IsEnum(ORDER)
  readonly sort: OrderType = ORDER.DESC;
}
