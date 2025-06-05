import { SetMetadata } from '@nestjs/common';

export const ALLOW_PARTIAL_TOKEN_KEY = 'allowPartialToken';
export const AllowPartialToken = () =>
  SetMetadata(ALLOW_PARTIAL_TOKEN_KEY, true);
