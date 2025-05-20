import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Request,
  BadRequestException,
  Query,
  ParseIntPipe,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  PaginatedCustomersDto,
} from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  CreateCustomerSchema,
  CreateCustomerWithAddressSchema,
  UpdateCustomerSchema,
} from './dto/customer.schema';
import { AddressDto } from './dto/create-address.dto';
import { AddressCreateSchema } from './dto/address.schema';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@src/auth/jwt.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
@Controller('customers')
//@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiExcludeEndpoint()
  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Request() req: Request,
  ) {
    const parsed = CreateCustomerSchema.safeParse(createCustomerDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    const result = parsed.data;
    return this.customersService.create(result, req);
  }

  @ApiExcludeEndpoint()
  @Post('withAddress')
  createWithAddress(
    @Body() createCustomerDto: CreateCustomerDto,
    @Request() req: Request,
  ) {
    const parsed = CreateCustomerWithAddressSchema.safeParse(createCustomerDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    const result = parsed.data;
    return this.customersService.createWithAddress(result, req);
  }

  @ApiExcludeEndpoint()
  @Post('addAddress')
  createAddAddress(
    @Body() createAddressDto: AddressDto,
    @Request() req: Request,
  ) {
    const parsed = AddressCreateSchema.safeParse(createAddressDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    const result = parsed.data;
    return this.customersService.createAddress(result, req);
  }

  @ApiExcludeEndpoint()
  @Post('teste')
  teste() {
    return this.customersService.validate();
  }

  @ApiExcludeEndpoint()
  @Post('unifyFindCPFCustomer')
  unifyFindCPFCustomer() {
    return this.customersService.unifyFindCPFCustomer();
  }

  @Put()
  async update(
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req: Request,
  ) {
    const parsed = UpdateCustomerSchema.safeParse(updateCustomerDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors);
    }
    return this.customersService.update(parsed.data, req);
  }

  @Get()
  @ApiOperation({
    summary:
      'Retrieve paginated list of customers with optional filters and sorting',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Customer name',
    example: 'Jonh',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Customer reference',
    example: 'jonhdoe@erp.com',
  })
  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID (public_id)',
    example: 'cm0l1u61r00003b6junq2pmbi',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'contato principal',
    example: '9299654878',
  })
  @ApiQuery({
    name: 'cpf',
    required: false,
    description: 'cpf/cnpj',
    example: '01385429534',
  })
  @ApiQuery({
    name: 'is_unified',
    required: false,
    description: 'is_unified se o cliente foi unificado',
    example: 'true ou false',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field to sort by (name, source, updated_at)',
    example: 'name',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order (asc, desc)',
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'List of customers with pagination and optional filters',
    type: PaginatedCustomersDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('organization_id') organization_id: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('cpf') cpf?: string,
    @Query('is_unified') is_unified?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('source') source?: string,
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('public_id') public_id?: string,
  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    }
    if (limit > 100) {
      throw new BadRequestException('Limit cannot be more than 100');
    }

    return this.customersService.findAll({
      page,
      limit,
      name,
      email,
      phone,
      cpf,
      organization_id,
      is_unified,
      sortBy,
      source,
      order,
      public_id,
    });
  }

  @Get('unified')
  @ApiOperation({
    summary:
      'Retrieve paginated list of customer unified with optional filters',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Customer name',
    example: 'Jonh',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Customer reference',
    example: 'jonhdoe@erp.com',
  })
  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID (public_id)',
    example: 'cm0l1u61r00003b6junq2pmbi',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'contato principal',
    example: '9299654878',
  })
  @ApiQuery({
    name: 'cpf',
    required: false,
    description: 'cpf/cnpj',
    example: '01385429534',
  })
  @ApiResponse({
    status: 200,
    description: 'List of customers with pagination and optional filters',
    type: PaginatedCustomersDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findUnifiedAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('organization_id') organization_id: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('cpf') cpf?: string,
  ): Promise<any> {
    if (!organization_id) {
      throw new BadRequestException('Organization ID is required');
    }
    if (limit > 100) {
      throw new BadRequestException('Limit cannot be more than 100');
    }

    return this.customersService.findUnifiedAll({
      page,
      limit,
      name,
      email,
      phone,
      cpf,
      organization_id,
    });
  }

  @Get('CustomerUnifieldCursor')
  findAllCursor(
    @Query('cursor', ParseIntPipe) cursor?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.customersService.findAllCustomerUnifieldCursor(cursor, limit);
  }

  @Get('unified/:organization/:id')
  getCustomerUnified(
    @Param('organization') organization_id: string,
    @Param('id') id: number,
  ) {
    return this.customersService.unifiedCustomerId(organization_id, id);
  }

  @Get('product/list')
  @ApiOperation({ summary: 'Obtém todas as interações do customerUnified' })
  getAllProductsCustomer(
    @Query('organization_id') organization_id: string,
    @Query('id') id: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.customersService.getAllProductsCustomer(
      organization_id,
      id,
      page,
      limit,
    );
  }
}
