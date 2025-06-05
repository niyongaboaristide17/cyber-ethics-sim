import { SetMetadata } from '@nestjs/common';
import { Claim } from '../enums/claim.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequiredPermissions = (...claims: Claim[]) =>
  SetMetadata(PERMISSIONS_KEY, claims);
