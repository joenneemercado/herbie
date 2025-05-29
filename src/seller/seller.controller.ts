import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto, FindSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { findSellerschema } from './dto/seller.schema';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post()
  create(@Body() createSellerDto: CreateSellerDto) {
    return this.sellerService.create(createSellerDto);
  }

  @Get('/all')
  findAll(@Query() findSellerDto: FindSellerDto, @Request() req: Request) {
    //console.log('createInteractionCampaing', intrationDto);
    const parsed = findSellerschema.safeParse(findSellerDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.sellerService.findAll(parsed.data, req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSellerDto: UpdateSellerDto) {
    return this.sellerService.update(+id, updateSellerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellerService.remove(+id);
  }
}
