import type { PageCursorDto } from './page-cursor.dto';

interface IPageMetaCursorDtoParameters {
  pageCursorDto: PageCursorDto;
  itemCount: number;
  nextCursor: number;
}

export class PageMetaCursorDto {
  readonly cursor: number;

  readonly take: number;

  readonly itemCount: number;

  readonly nextCursor: number;

  constructor({
    pageCursorDto,
    itemCount,
    nextCursor,
  }: IPageMetaCursorDtoParameters) {
    this.cursor = pageCursorDto.cursor;
    this.take = pageCursorDto.take;
    this.itemCount = itemCount;
    this.nextCursor = nextCursor;
  }
}
