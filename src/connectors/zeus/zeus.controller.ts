import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZeusService } from './zeus.service';
import { CreateZeusDto } from './dto/create-zeus.dto';
import { UpdateZeusDto } from './dto/update-zeus.dto';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import { } from '@src/campaigns/dto/create-campaign.dto';
import { createZeusArraySchema, createZeusSchema } from './dto/create-zeus-schema';
//Cadastro de clientes
// 1 - zeus
// -- 
// - Evento Zeus:
// Cadastro ZEUS
// Usar Pontos
// Ganhar Pontos
// 2 - Vtex
// 3 - Wifi
// 4 - Card
//@ApiTags('zeus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('connectors/zeus')
export class ZeusController {
  constructor(private readonly zeusService: ZeusService) { }

  @ApiExcludeEndpoint()
  @Post('/create/customer')
  create(
    @Body() createZeusDto: CreateZeusDto[],
    @Request() req: Request,
  ) {
    const parsed = createZeusSchema.safeParse(createZeusDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.zeusService.create(parsed.data, req);
  }

  @ApiExcludeEndpoint()
  @Post('/create/list/customer')
  createListCustumers(
    @Body() createZeusDto: CreateZeusDto[],
    @Request() req: Request,
  ) {
    if (!(createZeusDto.length <= 1000)) {
      throw new HttpException('Array size exceeded, limited to 1000', HttpStatus.PAYLOAD_TOO_LARGE);
    }
    const parsed = createZeusArraySchema.safeParse(createZeusDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.zeusService.createListCustumers(parsed.data, req);
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
