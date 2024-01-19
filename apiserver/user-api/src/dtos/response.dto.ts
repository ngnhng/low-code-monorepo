export class MetaResponseDto {
  statusCode: number;

  message: string;

  error: string;

  constructor(statusCode: number, message?: string, error?: string) {
    this.statusCode = statusCode;
    this.message = message ?? '';
    this.error = error ?? '';
  }
}

export class ResponseDto<T> {
  result: { data: T | null };

  meta: MetaResponseDto;

  constructor(data: T | null, meta: MetaResponseDto) {
    this.meta = meta;

    if (!data) {
      data = null;
    }

    this.result = {
      data,
    };
  }
}
