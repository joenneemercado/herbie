import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  BadRequestException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AudiencesService } from './audiences.service';
import {
  CreateAudienceDto,
  CreateAudienceInteractionDto,
} from './dto/create-audience.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import { createAudienceSchema } from './dto/audience.schema';

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
  @Get('/segment')
  findAllSegmented(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('organization_id') organization_id: string,
    @Query('date_birth_start') date_birth_start?: string[],
    @Query('date_birth_end') date_birth_end?: string[],
    @Query('gender') gender?: string,
    @Query('marital_status') marital_status?: string,
    @Query('date_created_start') date_created_start?: string,
    @Query('date_created_end') date_created_end?: string,
  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    }
    {
      return this.audiencesService.findAllSegmented({
        page,
        limit,
        organization_id,
        date_birth_start,
        date_birth_end,
        gender,
        marital_status,
        date_created_start,
        date_created_end,
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
    name: 'id',
    required: true,
    description: 'id of audience',
    example: 1,
    type: Number,
  })
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @Query('organization_id') organization_id: string,
  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    }
    {
      return this.audiencesService.findOne(id, organization_id);
    }
  }
}
