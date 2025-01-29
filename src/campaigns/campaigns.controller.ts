import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { createCampaingDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) { }

  // @Post()
  // create(@Body() createCampaignDto: createCampaingDto) {
  //   return this.campaignsService.create(createCampaignDto);
  // }
  @ApiBody({ type: createCampaingDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  create(
    @Body('organization_id') organization_id: string,
    @Body('idAudience') idAudience: number[],
    @Body('name') name: string,
    @Body('message') message: string,
    @Body('typeMessage') typeMessage: number,
    @Body('sendingBy') sendingBy: string,
    @Body('statusId') statusId: number,
    @Body('createdAt') createdAt: Date,
    @Body('updatedAt') updatedAt: Date,
    @Body('createdBy') createdBy: number,
    @Body('updatedBy') updatedBy: number,
    @Body('priority?') priority: number,
    @Body('channelId') channelId: number,
    @Body('tags') tags: number[],
    @Body('dateStart') dateStart: string,
    @Body('dateEnd') dateEnd: string,
    @Body('jsonMeta') jsonMeta: string,
    @Body('subject') subject: string,
  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    } {
      return this.campaignsService.create({
        idAudience,
        organization_id,
        name,
        message,
        typeMessage,
        statusId,
        sendingBy,
        createdAt,
        updatedAt,
        createdBy,
        updatedBy,
        priority,
        channelId,
        tags,
        dateStart,
        dateEnd,
        jsonMeta,
        subject,
      })
    };
  }

  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID (public_id)',
    example: 'cm0l1u61r00003b6junq2pmbi',
  })
  @ApiQuery({
    name: 'statusId',
    required: false,
    description: 'StatusId of audience',
    example: 1,
  })
  @ApiQuery({
    name: 'createdBy',
    required: false,
    description: 'Id of user',
    example: 1,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Name of campaing',
    example: 'Campaing eMercado',
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
    @Query('statusId') statusId: number,
    @Query('createdBy') createdBy: number,
    @Query('name') name: string,
  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    } {
      return this.campaignsService.findAll({
        page,
        limit,
        organization_id,
        statusId,
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
  @ApiQuery({
    name: 'id',
    required: true,
    description: 'id of Campaing',
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
      return this.campaignsService.findOne(
        id,
        organization_id
      )
    };
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
  //   return this.campaignsService.update(+id, updateCampaignDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.campaignsService.remove(+id);
  // }
}
