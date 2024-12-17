import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { AuthorizationGuard } from './common/guard/authorization/authorization.guard';
import { AuthScope } from './common/guard/authorization/authorization.decorator';

@Controller()
@UseGuards(AuthorizationGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiExcludeEndpoint()
  @AuthScope({ scopes: ['service:request'] })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
