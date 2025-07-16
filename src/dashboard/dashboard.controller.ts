import { Controller, Get, Post, Body, BadRequestException, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Aplica apenas neste controlador
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Resumo geral do dashboard', description: 'Retorna métricas gerais de unificação, perfis inconsistentes e totais de clientes.' })
  @ApiResponse({ status: 200, description: 'Resumo geral do dashboard', schema: { example: { quantityUnified: 100, qtdCustomer: 200, qtdUnUnified: 100, percentToUnified: 50, percentUnified: 50, profiles: { inconsistent_multiplus: 2, inconsistent_firstname: 1 } } } })
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get('totalPercentSource')
  @ApiOperation({ summary: 'Percentual de clientes por canal', description: 'Retorna a quantidade e o percentual de clientes agrupados por source (canal de origem).' })
  @ApiResponse({ status: 200, description: 'Lista de canais com quantidade e percentual', schema: { example: [ { source_name: 'Site', source_id: 1, count: 50, percentage: '50.00' } ] } })
  totalPercentSource() {
    return this.dashboardService.canaisQtdPercent();
  }

  @Get('rfm-segmentation')
  @ApiOperation({ summary: 'Retorna a segmentação RFM dos clientes da organização', description: 'Retorna a quantidade e porcentagem de clientes em cada segmento RFM, agrupados por organization_id.' })
  @ApiResponse({ status: 200, description: 'Lista de segmentos RFM com quantidade e porcentagem', schema: { example: [ { key: 'CHAMPIONS', name: 'Champions', description: 'Clientes com alta recência, frequência e valor monetário', count: 10, percentage: 12.5 } ] } })
  @ApiResponse({ status: 400, description: 'organization_id é obrigatório' })
  async rfmSegmentation(@Query('organization_id') organization_id: string) {
    if (!organization_id) {
      throw new BadRequestException('organization_id é obrigatório');
    }
    return this.dashboardService.rmfSegementation(organization_id);
  }

  @Get('demographic-data')
  @ApiOperation({ summary: 'Retorna os dados demográficos dos clientes unificados da organização', description: 'Retorna os dados demográficos dos clientes da organização, agrupados por organization_id.' })
  @ApiResponse({ status: 200, description: 'Dados demográficos agrupados por gênero, estado civil, aniversariantes por mês e gerações', schema: { example: { total: 100, gender: [ { key: 'Male', count: 60, percentage: 60 } ], marital_status: [ { key: 'single', count: 50, percentage: 50 } ], birthday_month: [ { month: 1, month_name: 'janeiro', count: 8, percentage: 8 } ], generations: [ { key: 'Geração Y (Millennials)', count: 40, percentage: 40 } ] } } })
  @ApiResponse({ status: 400, description: 'organization_id é obrigatório' })
  async dadosDemograficos(@Query('organization_id') organization_id: string) {
    if (!organization_id) {
      throw new BadRequestException('organization_id é obrigatório');
    }
    return this.dashboardService.dadosDemograficos(organization_id);
  }
}
