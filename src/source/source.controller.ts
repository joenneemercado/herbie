import {
  Controller,
  Get,
  Request,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { SourceService } from './source.service';
import { FindSourceDto } from './dto/create-source.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import { findSourcechema } from './dto/source.schema';

@ApiTags('source')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('source')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  // @Post()
  // create(@Body() createSourceDto: CreateSourceDto) {
  //   return this.sourceService.create(createSourceDto);
  // }

  @Get('/all')
  findAll(@Query() findSourceDto: FindSourceDto, @Request() req: Request) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findSourcechema.safeParse(findSourceDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.sourceService.findAll(parsed.data, req);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.sourceService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSourceDto: UpdateSourceDto) {
  //   return this.sourceService.update(+id, updateSourceDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.sourceService.remove(+id);
  // }
}
