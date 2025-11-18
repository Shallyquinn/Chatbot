import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AgentGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.error('AgentGuard - No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has agent role or type
    const isAgent =
      user.role === 'AGENT' ||
      user.role === 'agent' ||
      user.type === 'AGENT' ||
      user.type === 'agent';

    if (!isAgent) {
      console.error('AgentGuard - Access denied for user:', {
        userId: user.id,
        role: user.role,
        type: user.type,
      });
      throw new ForbiddenException('Access denied. Agent privileges required.');
    }

    console.log('AgentGuard - Agent access granted:', {
      userId: user.id,
      role: user.role,
    });

    return true;
  }
}
