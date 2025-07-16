import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class MailgridService {
  private readonly apiUrl = 'https://api.mailgrid.net.br/send/';
  private readonly token = process.env.MAILGRID_TOKEN; // Configure no .env

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async sendMail({
    to,
    subject,
    html,
    from,
    fromName,
  }: {
    to: string | string[];
    subject: string;
    html: string;
    from: string;
    fromName: string;
  }) {
    const payload = {
      token_auth: this.token,
      emailRemetente: from,
      nomeRemetente: fromName,
      emailDestino: Array.isArray(to) ? to : [to],
      assunto: subject,
      mensagem: html,
      mensagemTipo: 'html',
    };

    try {
      const response$ = this.httpService.post(this.apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const { data } = await firstValueFrom(response$);

      // A MailGrid sempre retorna 200, mas o campo 'codigo' indica sucesso
      if (data.codigo !== '200') {
        throw new InternalServerErrorException(
          `Erro ao enviar e-mail: ${data.status} (código ${data.codigo})`
        );
      }

      return {
        success: true,
        message: data.status,
        mailgrid: data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Falha ao enviar e-mail via MailGrid',
      );
    }
  }

  async sendBulkMail({
    to,
    subject,
    html,
    from,
    fromName,
    attachments,
  }: {
    to: string[];
    subject: string;
    html: string;
    from: string;
    fromName: string;
    attachments?: any[];
  }) {
    const results = [];
    for (const email of to) {
      const payload: any = {
        token_auth: this.token,
        emailRemetente: from,
        nomeRemetente: fromName,
        emailDestino: [email],
        assunto: subject,
        mensagem: html,
        mensagemTipo: 'html',
      };
      if (attachments && attachments.length > 0) {
        payload.anexos = attachments;
      }
      try {
        const response$ = this.httpService.post(this.apiUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        const { data } = await firstValueFrom(response$);
        results.push({ email, status: data.status, codigo: data.codigo });
      } catch (error) {
        results.push({ email, error: true, message: error.message });
      }
    }
    return results;
  }

  async sendBulkMailByCustomerIds(body: {
    customerIds: number[];
    subject: string;
    html: string;
    from: string;
    fromName: string;
    attachments?: any[];
  }) {
    const { customerIds, subject, html, from, fromName, attachments } = body;
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      throw new InternalServerErrorException('customerIds é obrigatório e deve ser um array de IDs');
    }
    // Buscar e-mails dos customers
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: customerIds }, email: { not: null } },
      select: { email: true },
    });
    const emails = customers.map(c => c.email).filter(Boolean);
    if (emails.length === 0) {
      throw new InternalServerErrorException('Nenhum e-mail encontrado para os IDs informados');
    }
    return this.sendBulkMail({
      to: emails,
      subject,
      html,
      from,
      fromName,
      attachments,
    });
  }
}