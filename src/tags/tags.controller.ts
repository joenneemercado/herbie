import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto, CreateTagWithAssociationDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }

  // @Post()
  // create(@Body() createTagDto: CreateTagDto) {
  //   return this.tagsService.create(createTagDto);
  // }

  @ApiBody({ type: CreateTagDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  create(
    @Body('organization_id') organization_id: string,
    @Body('name') name: string,
    @Body('createdBy') createdBy: number,

  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    } {
      return this.tagsService.create({
        name,
        organization_id,
        createdBy
      })
    };
  }

  @ApiBody({ type: CreateTagWithAssociationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('/association')
  createTagCustomer(
    @Body('organization_id') organization_id: string,
    @Body('idTag') idTag: number,
    @Body('idCustomer') idCustomer: number,
    @Body('idCampaing') idCampaing: number,
    @Body('createdBy') createdBy: number,

  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    } {
      return this.tagsService.createTagCustomer({
        idCampaing,
        organization_id,
        createdBy,
        idTag,
        idCustomer,
      })
    };
  }

  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID (public_id)',
    example: 'cm0l1u61r00003b6junq2pmbi',
    type: String,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'name of tag',
    example: 'eMercado',
    type: String,
  })
  @ApiQuery({
    name: 'createdBy',
    required: false,
    description: 'id of user',
    example: 1,
    type: String,
  })
  @ApiQuery({
    name: 'createdBy',
    required: false,
    description: 'id of user',
    example: 1,
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page numbe',
    example: 1,
  })

  @Get('/all')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('organization_id') organization_id: string,
    @Query('name') name: string,
    @Query('createdBy') createdBy: number,
  )
    : Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    } {
      return this.tagsService.findAll({
        page,
        limit,
        organization_id,
        name,
        createdBy,
      })
    };
  }

  
    @ApiQuery({
      name: 'organization_id',
      required: true,
      description: 'Organization ID (public_id)',
      example: 'cm0l1u61r00003b6junq2pmbi',
      type: String,
    })
    @ApiParam({
      name: 'id',
      required: true,
      description: 'id of tag',
      example: 1,
      type: Number,
    })
  
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @Query('organization_id') organization_id: string
  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    } {
      return this.tagsService.findOne(id, organization_id);
    }
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
  //   return this.tagsService.update(+id, updateTagDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.tagsService.remove(+id);
  // }
}
