import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Accept both enum values and string literals for flexibility
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
