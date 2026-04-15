import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

export enum UserRole {
  DECLARANT = 'DECLARANT',
  INSTRUCTEUR = 'INSTRUCTEUR',
  SUPERVISEUR = 'SUPERVISEUR',
  SIGNATAIRE = 'SIGNATAIRE',
  ADMIN_METIER = 'ADMIN_METIER',
  ADMIN_TECHNIQUE = 'ADMIN_TECHNIQUE',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;
    return requiredRoles.includes(user.role as UserRole);
  }
}
