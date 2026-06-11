import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // Endpoint is public
    }
    
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-key-123'
      });
      request.user = payload;
      
      // Super users bypass everything
      if (payload.role === 'SUPER_USER' || payload.permissions?.includes('ALL')) return true;
      
      // We pass the required permissions/roles via the @Roles decorator
      // If any of the required roles match the user's role OR their permissions array, grant access
      let userPermissions: string[] = [];
      if (typeof payload.permissions === 'string') {
        userPermissions = JSON.parse(payload.permissions);
      } else if (Array.isArray(payload.permissions)) {
        userPermissions = payload.permissions;
      }
      
      const hasRole = requiredRoles.includes(payload.role);
      const hasPermission = requiredRoles.some(role => userPermissions.includes(role));
      
      if (hasRole || hasPermission) {
        return true;
      }
      
      return false;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
