import { Request } from '@nestjs/common';

interface AuthenticatedUser {
  _id: string;
  email: string;
  claims: string[];
  isSuperuser: boolean;
  isTwoFactorAuthenticationEnabled: boolean;
  is2FAValidated: boolean;
}
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
