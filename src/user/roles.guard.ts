// roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('role', context.getHandler());
    if (!roles) {
      return true; // Jika tidak ada anotasi peran, izinkan akses
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Anda perlu menyesuaikan dengan cara Anda menyimpan informasi pengguna

    // Periksa apakah peran pengguna sesuai dengan yang diperlukan
    const hasRole = () => user.roles.some(role => roles.includes(role));

    return user && user.roles && hasRole();
  }
}
