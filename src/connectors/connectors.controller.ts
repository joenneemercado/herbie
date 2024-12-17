import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConnectorsService } from './connectors.service';
@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly appService: ConnectorsService) {}

  @ApiExcludeEndpoint()
  @Get('/sources/list')
  getSources() {
    return this.appService.findAll();
  }
}
