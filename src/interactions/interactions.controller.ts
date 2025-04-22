import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { createInteractionSchema } from './dto/create-interaction-schema';
import {
  FindInteractionSchema,
  findInteractionSchema,
} from './dto/interation.dto';

@ApiTags('Interactions')
@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @ApiExcludeEndpoint()
  @Post('/create')
  @ApiOperation({ summary: 'Cria uma nova interação' })
  @ApiResponse({ status: 201, description: 'Interação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(
    @Body() createInteractionDto: CreateInteractionDto,
    @Request() req: Request,
  ) {
    const parsed = createInteractionSchema.safeParse(createInteractionDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.interactionsService.create(parsed.data, req);
  }

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
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('organization_id') organization_id: string,
    @Query('customer_id') customer_id?: number,
    @Query('customer_unified_id') customer_unified_id?: number,
  ) {
    return this.interactionsService.findAll({
      page,
      limit,
      organization_id,
      customer_id,
      customer_unified_id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém uma única interação pelo ID' })
  @ApiResponse({ status: 200, description: 'Interação encontrada' })
  @ApiResponse({ status: 404, description: 'Interação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.interactionsService.findOne(+id);
  }

  // @Get('find/interaction')
  // findInteraction() {
  //   return this.interactionsService.findInteraction();
  // }
  // @Get('find/interaction')
  // findInteraction(
  //   @Query('seller') seller: string,
  //   @Query('date_start') date_start: string,
  //   @Query('date_end') date_end: string,
  //   @Query('ean') ean: string,
  // ) {
  //   return this.interactionsService.findInteraction(
  //     seller,
  //     date_start,
  //     date_end,
  //     ean,
  //   );
  // }

  // @Get('find/interaction')
  // findInteraction(
  //   @Query('seller') seller: string,
  //   @Query('dateBegin') dateBegin: string,
  //   @Query('dateEnd') dateEnd: string,
  //   @Query('ean') ean: string,
  //   @Query('organization_id') organization_id: string,
  //   @Query('refId') refId: string,
  //   @Query('status_order') status_order: string,
  // ) {
  //   return this.interactionsService.findInteraction(
  //     seller,
  //     dateBegin,
  //     dateEnd,
  //     ean,
  //     organization_id,
  //     refId,
  //     status_order,
  //   );
  // }

  @Get('find/interaction/vtex')
  findInteraction(
    @Query() findInteraction: FindInteractionSchema,
    @Request() req: Request,
  ) {
    const parsed = findInteractionSchema.safeParse(findInteraction);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.interactionsService.findInteraction(parsed.data, req);
  }

  // @Post('/create/customer')
  // create(@Body() createZeusDto: CreateClienteZeusDto, @Request() req: Request) {
  //   const parsed = createZeusSchema.safeParse(createZeusDto);
  //   if (!parsed.success) {
  //     throw new BadRequestException(parsed.error.errors);
  //   }
  //   return this.zeusService.create(parsed.data, req);
  // }
}
