import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query } from '@nestjs/common';
import { AudiencesService } from './audiences.service';
import { CreateAudienceDto } from './dto/create-audience.dto';
import { UpdateAudienceDto } from './dto/update-audience.dto';

@Controller('campaigns/audiences')
export class AudiencesController {
  constructor(private readonly audiencesService: AudiencesService) { }

  // @Post()
  // create(@Query() createAudienceDto: CreateAudienceDto) {
  //   return this.audiencesService.create(createAudienceDto);
  // }

  @Post()
  create(
    @Query('audiencia') audiencia: string,
    @Query('organization_id') organization_id: string,
    @Query('date_birth_start') date_birth_start: string[],
    @Query('date_birth_end') date_birth_end: string[],
    @Query('gender') gender: string,
    @Query('marital_status') marital_status: string,
    @Query('date_start') date_start: Date,
    @Query('date_end') date_end: Date,
  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    } {
      return this.audiencesService.create({
        audiencia,
        organization_id,
        date_birth_start,
        date_birth_end,
        gender,
        marital_status,
        date_start,
        date_end,
      })
    };
  }



  @Get('/all')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('organization_id') organization_id: string,
    @Query('date_birth_start') date_birth_start: string[],
    @Query('date_birth_end') date_birth_end: string[],
    @Query('gender') gender: string,
    @Query('marital_status') marital_status: string,
    @Query('date_start') date_start: Date,
    @Query('date_end') date_end: Date,

  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    } {
      return this.audiencesService.findAll({
        page,
        limit,
        organization_id,
        date_birth_start,
        date_birth_end,
        gender,
        marital_status,
        date_start,
        date_end,
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
      return this.audiencesService.findOne(+id, organization_id);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAudienceDto: UpdateAudienceDto) {
    return this.audiencesService.update(+id, updateAudienceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.audiencesService.remove(+id);
  }
}
