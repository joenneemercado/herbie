import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'HERBIE CDP NOVAERA 2000 - 2025!';
  }
}
