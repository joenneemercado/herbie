import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { RfmsegmentationService } from './rfmsegmentation.service';
import {
  CreateRfmsegmentationDto,
  FindRfmSegmentationDto,
} from './dto/create-rfmsegmentation.dto';
import { UpdateRfmsegmentationDto } from './dto/update-rfmsegmentation.dto';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import { findRfmSegmentationchema } from './dto/rfmsegmentation-schema';

@ApiTags('rfmsegmentation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('rfmsegmentation')
export class RfmsegmentationController {
  constructor(
    private readonly rfmsegmentationService: RfmsegmentationService,
  ) {}

  @ApiExcludeEndpoint()
  @Post()
  create(@Body() createRfmsegmentationDto: CreateRfmsegmentationDto) {
    return this.rfmsegmentationService.create(createRfmsegmentationDto);
  }

  @Get('/all')
  findAll(
    @Query() findRfmSegmentationDto: FindRfmSegmentationDto,
    @Request() req: Request,
  ) {
    const parsed = findRfmSegmentationchema.safeParse(findRfmSegmentationDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.rfmsegmentationService.findAll(parsed.data, req);
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rfmsegmentationService.findOne(+id);
  }

  @ApiExcludeEndpoint()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRfmsegmentationDto: UpdateRfmsegmentationDto,
  ) {
    return this.rfmsegmentationService.update(+id, updateRfmsegmentationDto);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rfmsegmentationService.remove(+id);
  }
}
