import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZeusService } from './zeus.service';
import { CreateClienteZeusDto } from './dto/create-zeus.dto';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import {} from '@src/campaigns/dto/create-campaign.dto';
import {
  createZeusArraySchema,
  createZeusSchema,
} from './dto/create-zeus-schema';
import {
  createInteractionAcumularZeusSchema,
  createInteractionResgatarZeusSchema,
} from './dto/interaction-zeus.schema';
import { CreateInteractionZeusDto } from './dto/interaction-zeus.dto';
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
  constructor(private readonly zeusService: ZeusService) {}

  @ApiExcludeEndpoint()
  @Post('/create/customer')
  create(@Body() createZeusDto: CreateClienteZeusDto, @Request() req: Request) {
    const parsed = createZeusSchema.safeParse(createZeusDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.zeusService.create(parsed.data, req);
  }

  @ApiExcludeEndpoint()
  @Post('/create/array/customer')
  createListCustumers(
    @Body() createZeusDto: CreateClienteZeusDto[],
    @Request() req: Request,
  ) {
    if (!(createZeusDto.length <= 100)) {
      throw new HttpException(
        'Array size exceeded, limited to 100',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }
    const parsed = createZeusArraySchema.safeParse(createZeusDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.zeusService.createListCustumers(parsed.data, req);
  }

  @Post('/interaction/cadastrar')
  interationCadastrar(
    @Body() createZeusDto: CreateClienteZeusDto,
    @Request() req: Request,
  ) {
    const parsed = createZeusSchema.safeParse(createZeusDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.zeusService.create(parsed.data, req);
  }

  @Post('/interaction/accumulate')
  interationAcumularPontos(
    @Body() createInteractionDto: CreateInteractionZeusDto,
    @Request() req: Request,
  ) {
    const parsed =
      createInteractionAcumularZeusSchema.safeParse(createInteractionDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.zeusService.interationAcumularPontos(parsed.data, req);
  }

  @Post('/interaction/reedem')
  interationResgatarPontos(
    @Body() createInteractionDto: CreateInteractionZeusDto,
    @Request() req: Request,
  ) {
    const parsed =
      createInteractionResgatarZeusSchema.safeParse(createInteractionDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.zeusService.interationResgatarPontos(parsed.data, req);
  }
}
