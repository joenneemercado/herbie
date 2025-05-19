import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  BadRequestException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import {
  CampaingContactDto,
  CampaingDetailsDto,
  CreateCampaingDto,
  FindCampaingDto,
} from './dto/create-campaign.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import {
  campaingContactDtochema,
  campaingDetailsDtochema,
  createCampaignDtochema,
  findCampaignchema,
} from './dto/campaign.schema';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  //@ApiBody({ type: CreateCampaingDto })
  //@ApiResponse({ status: 401, description: 'Unauthorized' })

  @ApiBody({ type: CreateCampaingDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post()
  create(
    @Body() createCampaingDto: CreateCampaingDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = createCampaignDtochema.safeParse(createCampaingDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.campaignsService.create(parsed.data, req);
  }

  @Get('/all')
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
  // findAll(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10,
  //   @Query('organization_id') organization_id: string,
  //   @Query('statusId') statusId: number,
  //   @Query('createdBy') createdBy: number,
  //   @Query('name') name: string,
  // ): Promise<any> {
  //   if (!organization_id) {
  //     throw new BadRequestException('Organization ID is required');
  //   }
  //   {
  //     return this.campaignsService.findAll({
  //       page,
  //       limit,
  //       organization_id,
  //       statusId,
  //       name,
  //       createdBy,
  //     });
  //   }
  // }
  findAll(@Query() findCampaingDto: FindCampaingDto, @Request() req: Request) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findCampaignchema.safeParse(findCampaingDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.campaignsService.findAll(parsed.data, req);
  }

  // @ApiQuery({
  //   name: 'organization_id',
  //   required: true,
  //   description: 'Organization ID (public_id)',
  //   example: 'cm0l1u61r00003b6junq2pmbi',
  //   type: String,
  // })
  // @ApiQuery({
  //   name: 'id',
  //   required: true,
  //   description: 'id of Campaing',
  //   example: 1,
  //   type: Number,
  // })
  // @Get(':id')
  // findOne(
  //   @Param('id') id: number,
  //   @Query('organization_id') organization_id: string,
  // ): Promise<any> {
  //   if (!organization_id) {
  //     throw new BadRequestException('Organization ID is required');
  //   }
  //   {
  //     return this.campaignsService.findOne(id, organization_id);
  //   }
  // }

  @Get('/info/details')
  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID (public_id)',
    example: 'cm0l1u61r00003b6junq2pmbi',
  })
  @ApiQuery({
    name: 'id',
    required: true,
    description: 'id of Campaing',
    example: 1,
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
  findCampaignDetails(
    @Query() campaingDetailsDto: CampaingDetailsDto,
    @Request() req: Request,
  ) {
    // console.log('createInteractionCampaing', campaingDetailsDto);
    const parsed = campaingDetailsDtochema.safeParse(campaingDetailsDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.campaignsService.findCampaignDetails(parsed.data, req);
  }

  @Get('/info/contacts')
  findCampaignContacts(
    @Query() campaingContactDto: CampaingContactDto,
    @Request() req: Request,
  ) {
    const parsed = campaingContactDtochema.safeParse(campaingContactDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.campaignsService.findCampaignContacts(parsed.data, req);
  }
}
