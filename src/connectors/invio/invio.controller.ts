import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Request,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InvioService } from './invio.service';
import { CreateInvioDto, FindAllInvioDto } from './dto/create-invio.dto';
import { UpdateInvioDto } from './dto/update-invio.dto';
import { findAllInvioDtoDtoSchema } from './dto/invio-schema';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Invio whatsapp')
@Controller('connectors/invio')
export class InvioController {
  constructor(private readonly invioService: InvioService) {}

  @ApiExcludeEndpoint()
  @Post()
  create(@Body() createInvioDto: CreateInvioDto) {
    return this.invioService.create(createInvioDto);
  }

  @Get('templates')
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
    name: 'name',
    type: String,
    required: true,
    description: 'name of template',
  })
  @ApiQuery({
    name: 'channelId',
    type: String,
    required: true,
    description: 'channelId',
  })

  // findAll(@Query() findAllInvioDto: FindAllInvioDto) {
  //   return this.invioService.findAll(findAllInvioDto);
  // }
  findAll(@Query() findAllInvioDto: FindAllInvioDto, @Request() req: Request) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findAllInvioDtoDtoSchema.safeParse(findAllInvioDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.invioService.findAll(parsed.data, req);
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invioService.findOne(+id);
  }

  @ApiExcludeEndpoint()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvioDto: UpdateInvioDto) {
    return this.invioService.update(+id, updateInvioDto);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invioService.remove(+id);
  }
}
