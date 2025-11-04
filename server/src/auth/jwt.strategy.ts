import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'honey-chatbot-secret-key-2024',
    });
  }

  async validate(payload: JwtPayload) {
    console.log(
      'JWT Strategy - Validating payload:',
      JSON.stringify(payload, null, 2),
    );

    // Verify the user still exists in database
    const user = await this.authService.validateToken(payload);
    console.log(
      'JWT Strategy - User from DB:',
      user ? `Found user ID: ${user.id}` : 'User not found',
    );

    if (!user) {
      console.error('JWT Strategy - Authentication failed: User not found');
      throw new UnauthorizedException('User not found or invalid token');
    }

    // Return essential user info without full database record
    const userInfo = {
      id: user.id,
      email: payload.email,
      role: payload.role,
      type: payload.type,
      name: user.name,
    };
    console.log(
      'JWT Strategy - Returning user info:',
      JSON.stringify(userInfo, null, 2),
    );
    return userInfo;
  }
}
