import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // constructor(
  //   private readonly reflector: Reflector,
  //   private readonly jwtService: JwtService,
  // ) {
  //   super();
  // }
  // async canActivate(context: ExecutionContext) {
  //   console.log('chegou');
  //   const canActivate = await super.canActivate(context);
  //   console.log(canActivate);
  //   if (!canActivate) {
  //     console.log('false');
  //     return false;
  //   }
  //   const requiredRoles = this.reflector.getAllAndOverride<string[]>(
  //     ROLES_KEY,
  //     [context.getHandler(), context.getClass()],
  //   );
  //   console.log(requiredRoles);
  //   if (!requiredRoles) {
  //     return true;
  //   }
  //   const request = context.switchToHttp().getRequest();
  //   const token = request.headers.authorization?.split(' ')[1];
  //   if (!token) {
  //     throw new UnauthorizedException('No token provided');
  //   }
  //   const payload = this.jwtService.verify(token);
  //   console.log(payload);
  //   const userRoles = payload.roles || [];
  //   const hasRole = () =>
  //     userRoles.some((role) => requiredRoles.includes(role));
  //   if (!hasRole()) {
  //     throw new UnauthorizedException('Insufficient permissions');
  //   }
  //   return true;
  // }
}
