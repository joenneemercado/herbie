import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }

  // @Post()
  // create(@Body() createTagDto: CreateTagDto) {
  //   return this.tagsService.create(createTagDto);
  // }

  @Post()
  create(
    @Query('organization_id') organization_id: string,
    @Query('name') name: string,
    @Query('createdBy') createdBy: number,

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

  @Post('/association')
  createTagCustomer(
    @Query('organization_id') organization_id: string,
    @Query('idTag') idTag: number,
    @Query('idCustomer') idCustomer: number,
    @Query('idCampaing') idCampaing: number,
    @Query('createdBy') createdBy: number,

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(+id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
