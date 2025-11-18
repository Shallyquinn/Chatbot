import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.error('AdminGuard - No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has admin role or type
    const isAdmin =
      user.role === 'ADMIN' ||
      user.role === 'admin' ||
      user.type === 'ADMIN' ||
      user.type === 'admin';

    if (!isAdmin) {
      console.error('AdminGuard - Access denied for user:', {
        userId: user.id,
        role: user.role,
        type: user.type,
      });
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    console.log('AdminGuard - Admin access granted:', {
      userId: user.id,
      role: user.role,
    });

    return true;
  }
}
