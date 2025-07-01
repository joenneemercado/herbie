import {
  Controller,
  Get,
  Request,
  BadRequestException,
  Query,
  UseGuards,
  Post,
  Body,
  Put,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AudiencesService } from './audiences.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import { updateAudienceSchema } from './dto/audience.schema';
import { findSegmentAudienceSchema } from './dto/audience.segment.schema';
import {
  FindAudienceContactDto,
  FindAudienceStatusDto,
  FindSegmentAudienceDto,
  UploadCSVDto,
} from './dto/create-audience.dto';
import { findAudienceContactsSchema } from './dto/audience.contacts.schema';
import { UpdateAudienceDto } from './dto/update-audience.dto';
import { findAudienceStatuschema } from './dto/audience.status.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { bucket } from '@src/firebase';
//import { bucket } from '@src/firebase';

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
  @ApiQuery({
    name: 'birth_day',
    required: false,
    description: 'Dia de nascimento',
    example: 15,
    type: Number,
  })
  @ApiQuery({
    name: 'birth_month',
    required: false,
    description: 'Mês de nascimento',
    example: 6,
    type: Number,
  })
  @ApiQuery({
    name: 'birth_year',
    required: false,
    description: 'Ano de nascimento',
    example: 1990,
    type: Number,
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

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload de arquivo CSV para criar uma audiência',
    schema: {
      type: 'object',
      properties: {
        // Descreve os campos que já estão no seu DTO
        organization_id: {
          type: 'string',
          description: 'ID da organização',
          example: 'org-abc123',
        },
        audienceName: {
          type: 'string',
          description: 'Nome da audiência',
          example: 'Nova audiência',
        },
        // Descreve o campo do arquivo
        files: {
          type: 'array', // Use 'array' pois você está usando FilesInterceptor (plural)
          items: {
            type: 'string',
            format: 'binary', // O formato 'binary' indica que é um arquivo
          },
          description: 'Arquivo CSV a ser enviado',
        },
      },
      required: ['organization_id', 'audienceName', 'files'], // Marque os campos como obrigatórios
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post('upload-csv')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadCSV(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dados: UploadCSVDto,
  ) {
    for (const file of files) {
      if (file) {
        const findAudiencie = await this.audiencesService.findExistingAudience(
          dados.organization_id,
          dados.audienceName,
        );
        if (findAudiencie) {
          return {
            message: 'Audience ja existe',
            audience_id: findAudiencie.id,
          };
        }
        const fileName = `imports/${uuid()}-${file.originalname}`;
        const fileRef = bucket.file(fileName);

        await fileRef.save(file.buffer, {
          contentType: file.mimetype,
          public: false, // true se quiser expor publicamente
          metadata: {
            firebaseStorageDownloadTokens: uuid(), // Para gerar URL de download
          },
        });
        const [url] = await fileRef.getSignedUrl({
          action: 'read',
          expires: Date.now() + 1000 * 60 * 60, // 1h
        });
        //console.log('url', url);

        const { organization_id, audienceName } = dados;
        // console.log({
        //   filePath: file.path,
        //   fileType: 'csv',
        //   organization_id,
        // });
        await this.audiencesService.addFileToQueue(
          fileName, // ou 'url' se quiser passar a URL assinada
          'csv',
          organization_id,
          audienceName,
        );
      }
    }
    return { message: 'File has been uploaded and is being processed.' };
  }
}
