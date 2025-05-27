import {
  Controller,
  Get,
  Request,
  Query,
  BadRequestException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  interactionDtoSchema,
  intrationCustomerUnifiedDtoSchema,
  IntrationCustomerUnifiedDtoSchema,
} from './dto/interaction-schema';
import {
  InterationCompraDto,
  InterationDto,
  InterationTeuCardDto,
} from './dto/interation.dto';
import { interactionCompraSchema } from './dto/interation-compra-schema';
import { interactionTeucardSchema } from './dto/interation-teucard.schema';
import { JwtAuthGuard } from '@src/auth/jwt.guard';

@ApiTags('Interactions')
@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtém todas as interações' })
  @ApiResponse({
    status: 200,
    description: 'Lista de interações retornada com sucesso',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Quantidade de itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'organization_id',
    type: String,
    required: true,
    description: 'ID da organização',
  })
  @ApiQuery({
    name: 'customer_id',
    type: Number,
    required: false,
    description: 'ID do cliente (opcional)',
  })
  @ApiQuery({
    name: 'customer_unified_id',
    type: Number,
    required: false,
    description: 'ID do cliente Unificado(opcional)',
  })
  findAll(@Query() interationDto: InterationDto, @Request() req: Request) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = interactionDtoSchema.safeParse(interationDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.interactionsService.findAll(parsed.data, req);
  }

  @Get('find/vtex')
  @ApiOperation({ summary: 'Obtém todas as interações' })
  @ApiResponse({
    status: 200,
    description: 'Lista de interações retornada com sucesso',
  })
  @ApiQuery({
    name: 'organization_id',
    type: String,
    required: true,
    description: 'ID da organização',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Quantidade de itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'ean',
    type: String,
    required: false,
    description: 'EAN do produto (opcional)',
  })
  @ApiQuery({
    name: 'RefId',
    type: String,
    required: false,
    description: 'RefId do produto (opcional)',
  })
  @ApiQuery({
    name: 'status_order',
    type: String,
    required: false,
    description: 'Status do pedido (opcional)',
  })
  @ApiQuery({
    name: 'sellerName',
    type: String,
    required: false,
    description: 'Nome do vendedor (opcional)',
  })
  @ApiQuery({
    name: 'dateBegin',
    type: String,
    required: false,
    description: 'Data do pedido (opcional)',
  })
  @ApiQuery({
    name: 'dataEnd',
    type: String,
    required: false,
    description: 'Data do fim pedido (opcional)',
  })
  findInteraction(
    @Query() interationCompraDto: InterationCompraDto,
    @Request() req: Request,
  ) {
    const parsed = interactionCompraSchema.safeParse(interationCompraDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.interactionsService.findInteraction(parsed.data, req);
  }

  @Get('customerUnified/:id')
  @ApiOperation({ summary: 'Obtém todas as interações do customerUnified' })
  getInteractionsByCustomerUnifiedId(
    @Param('id') id: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('tz') tz?: string,
  ) {
    return this.interactionsService.getInteractionsByCustomerUnifiedId(
      id,
      page,
      limit,
      tz,
    );
  }

  //todo comentando para nao usar por hora
  // @Get('find/teucard')
  // @ApiOperation({ summary: 'Obtém todas as interações' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Lista de interações retornada com sucesso',
  // })
  // @ApiQuery({
  //   name: 'organization_id',
  //   type: String,
  //   required: true,
  //   description: 'ID da organização',
  // })
  // @ApiQuery({
  //   name: 'page',
  //   type: Number,
  //   required: false,
  //   description: 'Número da página (padrão: 1)',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   type: Number,
  //   required: false,
  //   description: 'Quantidade de itens por página (padrão: 10)',
  // })
  // findInteractionTeuCard(
  //   @Query() interationTeuCardDto: InterationTeuCardDto,
  //   @Request() req: Request,
  // ) {
  //   const parsed = interactionTeucardSchema.safeParse(interationTeuCardDto);
  //   if (!parsed.success) {
  //     throw new BadRequestException(parsed.error.errors);
  //   }
  //   return this.interactionsService.findInteractionTeuCard(parsed.data, req);
  // }
  @Get('find/unified')
  @ApiOperation({ summary: 'Obtém todas as interações' })
  @ApiResponse({
    status: 200,
    description: 'Lista de interações retornada com sucesso',
  })
  @ApiQuery({
    name: 'organization_id',
    type: String,
    required: true,
    description: 'ID da organização',
  })
  @ApiQuery({
    name: 'cursor',
    type: Number,
    required: false,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Quantidade de itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'customer_unified_id',
    type: Number,
    required: false,
    description: 'ID do cliente Unificado(opcional)',
  })
  findInteractionCustomerUnified(
    @Query() interactionCustomerUnified: IntrationCustomerUnifiedDtoSchema,
    @Request() req: Request,
  ) {
    const parsed = intrationCustomerUnifiedDtoSchema.safeParse(
      interactionCustomerUnified,
    );
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.interactionsService.findInteractionCustomerUnified(
      parsed.data,
      req,
    );
  }
}
