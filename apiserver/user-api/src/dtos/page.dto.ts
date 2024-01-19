import type { PageMetaDto } from './page-meta.dto';
import type { PageMetaCursorDto } from './page-meta-cursor.dto';

export class PageDto<T> {
  readonly data: T[];

  readonly meta: PageMetaDto | PageMetaCursorDto;

  constructor(data: T[], meta: PageMetaDto | PageMetaCursorDto) {
    this.data = data;
    this.meta = meta;
  }
}
