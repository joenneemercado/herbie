import {
  Controller,
  Get,
  Request,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { FindChannelDto } from './dto/create-channel.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';
import { findChannelchema } from './dto/channels.schema';

@ApiTags('channels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  // @Post()
  // create(@Body() createChannelDto: CreateChannelDto) {
  //   return this.channelsService.create(createChannelDto);
  // }

  @Get('/all')
  findAll(@Query() findChannelDto: FindChannelDto, @Request() req: Request) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findChannelchema.safeParse(findChannelDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.channelsService.findAll(parsed.data, req);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.channelsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
  //   return this.channelsService.update(+id, updateChannelDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.channelsService.remove(+id);
  // }
}
