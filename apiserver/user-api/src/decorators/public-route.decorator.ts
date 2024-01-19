import { AUTH } from '@constants/auth.constant';
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(AUTH.IS_PUBLIC, true);
