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

  @ApiBody({ type: CreateCampaingDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  // create(
  //   @Body('organization_id') organization_id: string,
  //   @Body('idAudience') idAudience: number[],
  //   @Body('name') name: string,
  //   @Body('message') message: string,
  //   @Body('typeMessage') typeMessage: number,
  //   @Body('sendingBy') sendingBy: string,
  //   @Body('statusId') statusId: number,
  //   @Body('createdAt') createdAt: Date,
  //   @Body('updatedAt') updatedAt: Date,
  //   @Body('createdBy') createdBy: number,
  //   @Body('updatedBy') updatedBy: number,
  //   @Body('priority?') priority: number,
  //   @Body('channelId') channelId: number,
  //   @Body('tags') tags: number[],
  //   @Body('dateStart') dateStart: string,
  //   @Body('dateEnd') dateEnd: string,
  //   @Body('jsonMeta') jsonMeta: string,
  //   @Body('subject') subject: string,
  // ): Promise<any> {
  //   if (!organization_id) {
  //     throw new BadRequestException('Organization ID is required');
  //   }
  //   {
  //     return this.campaignsService.create({
  //       idAudience,
  //       organization_id,
  //       name,
  //       message,
  //       typeMessage,
  //       statusId,
  //       sendingBy,
  //       createdAt,
  //       updatedAt,
  //       createdBy,
  //       updatedBy,
  //       priority,
  //       channelId,
  //       tags,
  //       dateStart,
  //       dateEnd,
  //       jsonMeta,
  //       subject,
  //     });
  //   }
  // }
  @ApiBody({
    description: 'Create Campaign Payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'campanha what teste eM',
        },
        tags: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2],
        },
        typeMessage: {
          type: 'number',
          example: 1,
        },
        message: {
          type: 'string',
          example: "ola, ['NOME'] apenas teste",
        },
        idAudience: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [29],
        },
        createdBy: {
          type: 'number',
          example: 1,
        },
        channelId: {
          type: 'number',
          example: 2,
        },
        file: {
          type: 'string',
          nullable: true,
          example: null,
        },
        timeZone: {
          type: 'string',
          example: '-4',
        },
        organization_id: {
          type: 'string',
          example: 'aaaau6100003b6junq2222',
        },
        statusId: {
          type: 'number',
          example: 2,
        },
      },
      required: [
        'name',
        'typeMessage',
        'message',
        'idAudience',
        'createdBy',
        'channelId',
        'organization_id',
      ],
    },
  })
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
