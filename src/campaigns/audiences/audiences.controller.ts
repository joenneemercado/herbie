import {
  Controller,
  Get,
  Param,
  Request,
  BadRequestException,
  Query,
  UseGuards,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { AudiencesService } from './audiences.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import {
  createAudienceSchema,
  updateAudienceSchema,
} from './dto/audience.schema';
import { findSegmentAudienceSchema } from './dto/audience.segment.schema';
import {
  FindAudienceContactDto,
  FindAudienceStatusDto,
  FindSegmentAudienceDto,
} from './dto/create-audience.dto';
import { findAudienceContactsSchema } from './dto/audience.contacts.schema';
import { UpdateAudienceDto } from './dto/update-audience.dto';
import { findAudienceStatuschema } from './dto/audience.status.schema';

@ApiTags('Audiences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('campaigns/audiences')
export class AudiencesController {
  constructor(private readonly audiencesService: AudiencesService) {}

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
    description: 'Name of audience',
    example: 'audience eMercado',
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
  //  @ApiResponse({
  //      status: 200,
  //      description: 'List all audiences with pagination and optional filters',
  //      type: PaginatedAudiencesDto,
  //    })
  @UseGuards(JwtAuthGuard)
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
    }
    {
      return this.audiencesService.findAll({
        page,
        limit,
        organization_id,
        statusId,
        name,
        createdBy,
      });
    }
  }

  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID (public_id)',
    example: 'cm0l1u61r00003b6junq2pmbi',
    type: String,
  })
  @ApiQuery({
    name: 'date_birth_start',
    required: false,
    description: 'Start date of birthday',
    example: '["1984-02-10","1984-07-15"]',
    type: [String],
  })
  @ApiQuery({
    name: 'date_birth_end',
    required: false,
    description: 'end date of birthday',
    example: '[1984-02-10,1984-07-15]',
    type: [String],
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    description: 'gender',
    example: 'female or male',
    type: String,
  })
  @ApiQuery({
    name: 'marital_status',
    required: false,
    description: 'marital',
    example: 'singer',
    type: String,
  })
  @ApiQuery({
    name: 'date_created_start',
    required: false,
    description: 'start date of criation',
    example: '2024-09-23',
    type: String,
  })
  @ApiQuery({
    name: 'date_created_end',
    required: false,
    description: 'end date of criation',
    example: '2024-09-23',
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
  @Get('/segment/interation')
  findAllSegmentedInteration(
    @Query() findSegmentAudienceDto: FindSegmentAudienceDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findSegmentAudienceSchema.safeParse(findSegmentAudienceDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.audiencesService.findAllSegmentedInteration(parsed.data, req);
  }

  @Get('/segment/count/interation')
  findAllSegmentedInterationCount(
    @Query() findSegmentAudienceDto: FindSegmentAudienceDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findSegmentAudienceSchema.safeParse(findSegmentAudienceDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.audiencesService.findAllSegmentedInterationCount(
      parsed.data,
      req,
    );
  }

  @Post('/create/segment')
  createAudienceSegment(
    @Body() findSegmentAudienceDto: FindSegmentAudienceDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', findSegmentAudienceDto);
    const parsed = findSegmentAudienceSchema.safeParse(findSegmentAudienceDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.audiencesService.createAudienceSegment(parsed.data, req);
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
    description: 'id of audience',
    example: 1,
    type: Number,
  })
  @Get('/info/contacts')
  // findOne(
  //   @Param('id') id: number,
  //   @Query('organization_id') organization_id: string,
  // ): Promise<any> {
  //   if (!organization_id) {
  //     throw new BadRequestException('Organization ID is required');
  //   }
  //   {
  //     return this.audiencesService.findOne(id, organization_id);
  //   }
  // }
  findAudienceContacts(
    @Query() findSegmentAudienceDto: FindAudienceContactDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findAudienceContactsSchema.safeParse(findSegmentAudienceDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.audiencesService.findAudienceContacts(parsed.data, req);
  }

  @Get('/status')
  audienceStatus(
    @Query() findAudienceStatusDto: FindAudienceStatusDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', findSegmentAudienceDto);
    const parsed = findAudienceStatuschema.safeParse(findAudienceStatusDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.audiencesService.audienceStatus(parsed.data, req);
  }

  @Put('/update/status')
  updateAudienceSegment(
    @Query() updateAudienceDto: UpdateAudienceDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', findSegmentAudienceDto);
    const parsed = updateAudienceSchema.safeParse(updateAudienceDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.audiencesService.updateAudienceSegment(parsed.data, req);
  }
}
