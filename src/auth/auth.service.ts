import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(dados: LoginDto): Promise<any> {
    const { username, password } = dados;
    const user = await this.usersService.findOneLogin(username);
    if (!user) {
      console.log('Please check your login credentials');
      return null;
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (user && checkPassword) {
      const { password, ...result } = user;
      return result;
    }
    console.log('Usuario não encontrado');
    return null;
  }

  async login(user: LoginDto) {
    //console.log('Usuario', user);
    try {
      const dados = await this.validateUser(user);
      //console.log('dados', dados);
      if (!dados) {
        throw new HttpException('Please, check username or password', 401);
        //throw new UnauthorizedException();
      }

      //console.log(dados)
      const organizations = dados.members.map((org) => org.organization_id);
      const payload = {
        name: dados.name,
        sub: dados.id,
        orgs: organizations,
        type: dados.role,
        scopes: this.getUserScopes(String(dados.role).toLowerCase()),
      };
      //console.log('payload', payload);
      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '1d',
        }),
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const newPayload = {
        name: payload.name,
        sub: payload.sub,
        orgs: payload.orgs,
        type: payload.role,
        scopes: payload.scopes,
      };
      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        }),
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  getUserScopes(type: string) {
    //console.log(type);
    return {
      user: ['user:read_own', 'user:update_own', 'user:delete_own'],
      admin: [
        'user:read',
        'user:update',
        'user:delete',
        'billing:read',
        'billing:update',
        'member:manage',
        'organization:manage',
      ],
      public: ['public:read'],
      member: [
        'user:read_own',
        'user:update_own',
        'billing:read_own',
        'service:request',
      ],
      billing: [
        'billing:read',
        'billing:update',
        'user:read',
        'organization:read',
      ],
      super: [
        'user:read',
        'user:update',
        'user:delete',
        'billing:read',
        'billing:update',
        'member:manage',
        'organization:manage',
        'super:all',
      ],
    }[type.toLowerCase()];
  }
}
