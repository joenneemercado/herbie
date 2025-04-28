import {
  Controller,
  Get,
  Param,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import {
  intrationCustomerUnifiedDtoSchema,
  IntrationCustomerUnifiedDtoSchema,
  intrationDtoSchema,
} from './dto/interaction-schema';
import {
  FindInteractionSchema,
  findInteractionSchema,
  FindInteractionTeucardSchema,
  findInteractionTeucardSchema,
  IntrationDto,
} from './dto/interation.dto';

@ApiTags('Interactions')
@Controller('interactions')
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
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('organization_id') organization_id: string,
    @Query('customer_id') customer_id?: number,
    @Query('customer_unified_id') customer_unified_id?: number,
    @Query('orderby') orderby?: string,
  ) {
    return this.interactionsService.findAll({
      page,
      limit,
      organization_id,
      customer_id,
      customer_unified_id,
      orderby: orderby as 'asc' | 'desc',
    });
  }

  // findAll(@Query() intrationDto: IntrationDto, @Request() req: Request) {
  //   //console.log('createInteractionCampaing', intrationDto);
  //   const parsed = intrationDtoSchema.safeParse(intrationDto);
  //   if (!parsed.success) {
  //     throw new BadRequestException(parsed.error.errors);
  //   }
  //   return this.interactionsService.findAll(parsed.data, req);
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém uma única interação pelo ID' })
  @ApiResponse({ status: 200, description: 'Interação encontrada' })
  @ApiResponse({ status: 404, description: 'Interação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.interactionsService.findOne(+id);
  }

  @Get('find/interaction/vtex')
  @ApiOperation({ summary: 'Obtém todas as interações' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Lista de interações retornada com sucesso',
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
  // @ApiQuery({
  //   name: 'organization_id',
  //   type: String,
  //   required: true,
  //   description: 'ID da organização',
  // })
  // @ApiQuery({
  //   name: 'customer_id',
  //   type: Number,
  //   required: false,
  //   description: 'ID do cliente (opcional)',
  // })
  // @ApiQuery({
  //   name: 'customer_unified_id',
  //   type: Number,
  //   required: false,
  //   description: 'ID do cliente Unificado(opcional)',
  // })
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

  @Get('find/interaction/teucard')
  findInteractionTeuCard(
    @Query() findInteraction: FindInteractionTeucardSchema,
    @Request() req: Request,
  ) {
    const parsed = findInteractionTeucardSchema.safeParse(findInteraction);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.interactionsService.findInteractionTeuCard(parsed.data, req);
  }

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

  // @Post('/create/customer')
  // create(@Body() createZeusDto: CreateClienteZeusDto, @Request() req: Request) {
  //   const parsed = createZeusSchema.safeParse(createZeusDto);
  //   if (!parsed.success) {
  //     throw new BadRequestException(parsed.error.errors);
  //   }
  //   return this.zeusService.create(parsed.data, req);
  // }

  @ApiExcludeEndpoint()
  @Get('/campaing/contact')
  findInteractionCampaingContact(
    @Query() intrationDto: IntrationDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = intrationDtoSchema.safeParse(intrationDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.interactionsService.findInteractionCampaingContact(
      parsed.data,
      req,
    );
  }
}
