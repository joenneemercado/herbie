import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Scope } from './authorization.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const authScope =
  //     this.reflector.get<Scope>('authScope', context.getHandler()) ||
  //     this.reflector.get<Scope>('authScope', context.getClass());
  //   console.log(authScope);
  //   if (!authScope) {
  //     return true;
  //   }
  //   const request = context.switchToHttp().getRequest();
  //   const token = this.extractTokenFromHeader(request);
  //   if (!token) {
  //     throw new UnauthorizedException(
  //       'An access token is required for this operation',
  //     );
  //   }
  //   const jwtSecret = this.configService.get('JWT_SECRET');
  //   const {
  //     scopes: userScopes,
  //     sub: userId,
  //     type: userType,
  //   } = this.validateTokenAndGetPayload(token, jwtSecret);
  //   console.log(userScopes);
  //   console.log(userId);
  //   console.log(userType);

  //   const hasScope = userScopes.some((scope) => {
  //     console.log(scope);
  //     console.log(authScope);
  //     return userScopes.includes(scope);
  //   });
  //   console.log(hasScope);
  //   if (!hasScope) {
  //     throw new ForbiddenException(
  //       'You are not allowed to perform this operation',
  //     );
  //   }
  //   const hasOwnerScope = userScopes.some((scope) => scope.endsWith('own'));
  //   const hasOwnerParam = Object.keys(request.params).includes(
  //     authScope.ownerParam,
  //   );

  //   if (hasOwnerScope && hasOwnerParam && userType !== 'admin') {
  //     const isResourceFromOwner =
  //       request.params[authScope.ownerParam] === userId;
  //     if (!isResourceFromOwner) {
  //       throw new ForbiddenException(
  //         'You are not allowed to perform this operation',
  //       );
  //     }
  //   }
  //   return true;
  // }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authScope =
      this.reflector.get<Scope>('authScope', context.getHandler()) ||
      this.reflector.get<Scope>('authScope', context.getClass());

    //console.log('authScope:', authScope);
    if (!authScope) {
      return true; // Se não houver escopos definidos, o acesso é permitido.
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'An access token is required for this operation',
      );
    }

    const jwtSecret = this.configService.get('JWT_SECRET');
    const {
      scopes: userScopes,
      sub: userId,
      type: userType,
    } = this.validateTokenAndGetPayload(token, jwtSecret);

    //console.log('userScopes:', userScopes);
    // console.log('userId:', userId);
    // console.log('userType:', userType);

    // console.log(authScope);
    //console.log(authScope.scopes);
    // Verificação dos escopos do usuário
    const hasScope = authScope.scopes.some((requiredScope) => {
      return userScopes.includes(requiredScope);
    });

    // console.log('hasScope:', hasScope);
    if (!hasScope) {
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      );
    }

    // Verificação de propriedade do recurso
    const hasOwnerScope = authScope.scopes.some((scope) =>
      scope.endsWith('own'),
    );
    const hasOwnerParam =
      authScope.ownerParam &&
      Object.keys(request.params).includes(authScope.ownerParam);

    if (hasOwnerScope && hasOwnerParam && userType !== 'admin') {
      const isResourceFromOwner =
        request.params[authScope.ownerParam] === userId;
      if (!isResourceFromOwner) {
        throw new ForbiddenException(
          'You are not allowed to perform this operation',
        );
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private validateTokenAndGetPayload(token: string, secret: string) {
    try {
      return this.jwtService.verify(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
