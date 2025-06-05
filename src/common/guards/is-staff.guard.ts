import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class IsStaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (user?.isSuperuser) return true;

    // Allow if the user is a staff member
    return user?.isStaff === true;
  }
}
