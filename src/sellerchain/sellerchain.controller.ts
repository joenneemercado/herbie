import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { SellerchainService } from './sellerchain.service';
import {
  CreateSellerchainDto,
  FindSellerchainDto,
} from './dto/create-sellerchain.dto';
import { UpdateSellerchainDto } from './dto/update-sellerchain.dto';
import { findSellerChainchema } from './dto/sellerchain-schema';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';

@ApiTags('sellerchain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('sellerchain')
export class SellerchainController {
  constructor(private readonly sellerchainService: SellerchainService) {}

  @ApiExcludeEndpoint()
  @Post()
  create(@Body() createSellerchainDto: CreateSellerchainDto) {
    return this.sellerchainService.create(createSellerchainDto);
  }

  @Get('/all')
  findAll(
    @Query() findChannelDto: FindSellerchainDto,
    @Request() req: Request,
  ) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findSellerChainchema.safeParse(findChannelDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.sellerchainService.findAll(parsed.data, req);
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellerchainService.findOne(+id);
  }

  @ApiExcludeEndpoint()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSellerchainDto: UpdateSellerchainDto,
  ) {
    return this.sellerchainService.update(+id, updateSellerchainDto);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellerchainService.remove(+id);
  }
}
