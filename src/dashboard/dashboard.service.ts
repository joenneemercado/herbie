import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const quantityUnified = await this.prisma.customerUnified.count();
      const qtdCustomer = await this.prisma.customer.count();
      const qtdUnUnified = await this.prisma.customer.count({
        where: {
          OR: [{ is_unified: false }, { is_unified: null }],
        },
      });
      //Contatos restantes=Total de contatos−Contatos unificados=91000−35000=56000
      const percentToUnified =
        ((Number(qtdCustomer) - Number(qtdUnUnified)) / Number(qtdCustomer)) *
        100;
      const percentUnified = (Number(qtdUnUnified) / Number(qtdCustomer)) * 100;

      const profilesInconsistentes = await this.prisma.customerUnified.groupBy({
        by: ['status_id'],
        _count: {
          status_id: true,
        },
      });
      console.log(profilesInconsistentes);
      return {
        quantityUnified,
        qtdCustomer,
        qtdUnUnified,
        percentToUnified: Number(percentToUnified.toFixed(2)),
        percentUnified: Number(percentUnified.toFixed(2)),
        profiles: {
          inconsistent_multiplus: Number(
            profilesInconsistentes.find((status) => status.status_id === 2)
              ?._count.status_id,
          ),
          inconsistent_firstname: Number(
            profilesInconsistentes.find((status) => status.status_id === 3)
              ?._count.status_id,
          ),
          inconsistent_lastname: Number(
            profilesInconsistentes.find((status) => status.status_id === 4)
              ?._count.status_id,
          ),
          inconsistent_cpf: Number(
            profilesInconsistentes.find((status) => status.status_id === 5)
              ?._count.status_id,
          ),
          inconsistent_email: Number(
            profilesInconsistentes.find((status) => status.status_id === 6)
              ?._count.status_id,
          ),
          inconsistent_phone: Number(
            profilesInconsistentes.find((status) => status.status_id === 7)
              ?._count.status_id,
          ),
          inconsistent_gender: Number(
            profilesInconsistentes.find((status) => status.status_id === 8)
              ?._count.status_id,
          ),
          inconsistent_date_birth: Number(
            profilesInconsistentes.find((status) => status.status_id === 9)
              ?._count.status_id,
          ),
        },
      };
    } catch (error) {
      console.log(error);
    }
  }

  async canaisQtdPercent() {
    try {
      // Primeiro, obtenha o total de registros na tabela Customer
      const totalCustomers = await this.prisma.customer.count();

      // Em seguida, agrupe por source_id e obtenha a contagem para cada Source
      const sourcesCount = await this.prisma.customer.groupBy({
        by: ['source_id'],
        _count: {
          source_id: true,
        },
      });

      // Agora, calcule a porcentagem para cada Source e formate os resultados
      const result = [];
      for (const s of sourcesCount) {
        const count = s._count.source_id;
        const name = await this.prisma.source.findFirst({
          select: {
            name: true,
          },
          where: {
            id: s.source_id,
          },
        });
        const percentage = ((count / totalCustomers) * 100).toFixed(2);
        result.push({
          source_name: name.name,
          source_id: s.source_id,
          count,
          percentage: `${percentage}`,
        });
      }

      return result;
    } catch (error) {
      console.error(
        'Erro ao calcular a quantidade e porcentagem dos Sources:',
        error,
      );
      throw error;
    }
  }
}
