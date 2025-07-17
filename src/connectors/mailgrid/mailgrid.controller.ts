import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MailgridService } from './mailgrid.service';
import { PrismaService } from '@src/database/prisma.service';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Mailgrid')
@Controller('mailgrid')
export class MailgridController {
  constructor(
    private readonly mailgridService: MailgridService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('send')
  async send(@Body() body: {
    to: string | string[];
    subject: string;
    html: string;
    from: string;
    fromName: string;
  }) {
    return this.mailgridService.sendMail(body);
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Envio em massa de e-mails para customers', description: 'Envia e-mails para uma lista de customers informando os IDs, assunto, mensagem e anexos (opcional).' })
  @ApiBody({ schema: { properties: { customerIds: { type: 'array', items: { type: 'number' }, example: [1,2,3] }, subject: { type: 'string', example: 'Assunto do e-mail' }, html: { type: 'string', example: '<b>Mensagem em HTML</b>' }, from: { type: 'string', example: 'remetente@dominio.com' }, fromName: { type: 'string', example: 'Nome do Remetente' }, attachments: { type: 'array', items: { type: 'object' } } } } })
  @ApiResponse({ status: 200, description: 'Resultado do envio em massa', schema: { example: [ { email: 'cliente@exemplo.com', status: 'MSG ENVIADA', codigo: '200' }, { email: 'cliente2@exemplo.com', error: true, message: 'Falha ao enviar' } ] } })
  @ApiResponse({ status: 400, description: 'customerIds é obrigatório e deve ser um array de IDs' })
  async sendBulk(@Body() body: {
    customerIds: number[];
    subject: string;
    html: string;
    from: string;
    fromName: string;
    attachments?: any[];
  }) {
    if (!body.customerIds || !Array.isArray(body.customerIds) || body.customerIds.length === 0) {
      throw new BadRequestException('customerIds é obrigatório e deve ser um array de IDs');
    }
    return this.mailgridService.sendBulkMailByCustomerIds(body);
  }

  @Post('test-send')
  @ApiOperation({ summary: 'Envio de e-mail de teste', description: 'Envia um e-mail para um endereço digitado, sem depender de customerId.' })
  @ApiBody({ schema: { properties: { to: { type: 'string', example: 'destinatario@exemplo.com' }, subject: { type: 'string', example: 'Assunto do teste' }, html: { type: 'string', example: '<b>Mensagem de teste</b>' }, from: { type: 'string', example: 'remetente@dominio.com' }, fromName: { type: 'string', example: 'Nome do Remetente' }, attachments: { type: 'array', items: { type: 'object' } } } } })
  @ApiResponse({ status: 200, description: 'Resultado do envio de teste', schema: { example: { success: true, message: 'MSG ENVIADA', mailgrid: { /* ... */ } } } })
  @ApiResponse({ status: 400, description: 'Dados obrigatórios ausentes' })
  async testSend(@Body() body: {
    to: string;
    subject: string;
    html: string;
    from: string;
    fromName: string;
    attachments?: any[];
  }) {
    if (!body.to || !body.subject || !body.html || !body.from || !body.fromName) {
      throw new BadRequestException('Campos obrigatórios ausentes');
    }
    console.log({
        to: body.to,
        subject: body.subject,
        html: body.html,
        from: body.from,
        fromName: body.fromName,
      })
    return this.mailgridService.sendMail({
      to: body.to,
      subject: body.subject,
      html: body.html,
      from: body.from,
      fromName: body.fromName,
    });
  }
}