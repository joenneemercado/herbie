import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  BadRequestException,
  Query,
  UseGuards,
  Patch,
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
  updateCampaignDtoSchema,
} from './dto/campaign.schema';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @ApiBody({ type: CreateCampaingDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post()
  async create(
    @Body() createCampaingDto: CreateCampaingDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = createCampaignDtochema.safeParse(createCampaingDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    const result = await this.campaignsService.create(parsed.data, req);
    if (result) {
      return result;
    }
    throw new BadRequestException('Erro ao criar campanha');
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
  findAll(@Query() findCampaingDto: FindCampaingDto, @Request() req: Request) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findCampaignchema.safeParse(findCampaingDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.campaignsService.findAll(parsed.data, req);
  }

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

  @ApiBody({ type: UpdateCampaignDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Patch('/update/status')
  update(
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req: Request,
  ) {
    console.log('updateCampaignDto', updateCampaignDto);
    const parsed = updateCampaignDtoSchema.safeParse(updateCampaignDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.campaignsService.update(parsed.data, req);
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

  @Get('/customer')
  getCampaingCustomer(
    @Query('id') id: string,
    @Query('organization_id') organization_id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.campaignsService.getCampaingCustomer(
      organization_id,
      id,
      page,
      limit,
    );
  }
}
