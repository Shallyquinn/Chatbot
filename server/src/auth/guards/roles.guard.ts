import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles required, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.error('RolesGuard - No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has any of the required roles
    const userRole = (user.role || user.type || '').toUpperCase();
    const hasRole = requiredRoles.some(
      (role) => userRole === role.toUpperCase(),
    );

    if (!hasRole) {
      console.error('RolesGuard - Access denied for user:', {
        userId: user.id,
        userRole: userRole,
        requiredRoles: requiredRoles,
      });
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    console.log('RolesGuard - Access granted:', {
      userId: user.id,
      userRole: userRole,
      requiredRoles: requiredRoles,
    });

    return true;
  }
}
