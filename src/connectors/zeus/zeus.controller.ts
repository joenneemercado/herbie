import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ZeusService } from './zeus.service';
import { CreateZeusDto } from './dto/create-zeus.dto';
import { UpdateZeusDto } from './dto/update-zeus.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('connectors/zeus')
export class ZeusController {
  constructor(private readonly zeusService: ZeusService) {}
  @ApiExcludeEndpoint()
  @Post()
  create(@Body() createZeusDto: CreateZeusDto) {
    return this.zeusService.create(createZeusDto);
  }
  @ApiExcludeEndpoint()
  @Get()
  findAll() {
    return this.zeusService.findAll();
  }
  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zeusService.findOne(+id);
  }
  @ApiExcludeEndpoint()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZeusDto: UpdateZeusDto) {
    return this.zeusService.update(+id, updateZeusDto);
  }
  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zeusService.remove(+id);
  }
}
