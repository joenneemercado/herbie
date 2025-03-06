import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { createInteractionSchema } from './dto/create-interaction-schema';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}
  @ApiExcludeEndpoint()
  @Post('/create')
  create(
    @Body() createInteractionDto: CreateInteractionDto,
    @Request() req: Request,
  ) {
    const parsed = createInteractionSchema.safeParse(createInteractionDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    //console.log('parsed.data',parsed.data);
    return this.interactionsService.create(parsed.data, req);
   // return this.interactionsService.create(createInteractionDto);
  }
  @ApiExcludeEndpoint()
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('organization_id') organization_id: string,
    @Query('customer_id') customer_id?: number,
  ) {
    return this.interactionsService.findAll({
      page,
      limit,
      organization_id,
      customer_id,
    });
  }
  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interactionsService.findOne(+id);
  }
  @ApiExcludeEndpoint()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInteractionDto: UpdateInteractionDto,
  ) {
    return this.interactionsService.update(+id, updateInteractionDto);
  }
  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interactionsService.remove(+id);
  }
}
