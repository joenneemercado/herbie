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

  async rmfSegementation(organization_id?: string) {
    try {
      // Busca todos os segmentos cadastrados na tabela CustomerField
      const where: any = { type: 'SEGMENT' };
      if (organization_id) {
        where.organization_id = organization_id;
      }
      const segments = await this.prisma.customerField.findMany({
        where,
        select: {
          value: true,
        },
      });

      // Definição dos segmentos RFM
      const SEGMENTS = {
        CHAMPIONS: {
          name: 'Champions',
          description: 'Clientes com alta recência, frequência e valor monetário',
        },
        LOYAL_CUSTOMERS: {
          name: 'Loyal Customers',
          description: 'Clientes fiéis com boa frequência e valor',
        },
        POTENTIAL_LOYALISTS: {
          name: 'Potential Loyalists',
          description: 'Clientes com potencial para se tornarem fiéis',
        },
        RECENT_CUSTOMERS: {
          name: 'Recent Customers',
          description: 'Clientes recentes com baixa frequência',
        },
        PROMISING: {
          name: 'Promising',
          description: 'Clientes promissores com baixa recência mas boa frequência',
        },
        NEEDS_ATTENTION: {
          name: 'Needs Attention',
          description: 'Clientes que precisam de atenção',
        },
        AT_RISK: {
          name: 'At Risk',
          description: 'Clientes em risco de abandono',
        },
        CANNOT_LOSE: {
          name: 'Cannot Lose',
          description: 'Clientes valiosos que não podem ser perdidos',
        },
        HIBERNATING: {
          name: 'Hibernating',
          description: 'Clientes inativos há muito tempo',
        },
        LOST: {
          name: 'Lost',
          description: 'Clientes perdidos',
        },
      };

      // Função para normalizar o value para UPPER_SNAKE_CASE
      function toUpperSnakeCase(str: string) {
        return str
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/\s+/g, '_')
          .toUpperCase();
      }
      // Contagem de cada segmento
      const total = segments.length;
      const counts = Object.keys(SEGMENTS).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {} as Record<string, number>);
      for (const seg of segments) {
        if (seg.value) {
          const normalized = toUpperSnakeCase(seg.value);
          if (counts.hasOwnProperty(normalized)) {
            counts[normalized]++;
          }
        }
      }
      // Monta o resultado para o gráfico
      const result = Object.entries(SEGMENTS).map(([key, info]) => {
        const count = counts[key] || 0;
        return {
          key,
          name: info.name,
          description: info.description,
          count,
          percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
        };
      });
      return result;
    } catch (error) {
      console.error('Erro ao calcular segmentação RFM:', error);
      throw error;
    }
  }

  async dadosDemograficos(organization_id: string) {
    // Mapas de normalização
    const genderMap = {
      Masculino: 'Male',
      Feminino: 'Female',
      Outro: 'Other',
      others: 'Other',
    };
    const maritalStatusMap = {
      'Solteiro(a)': 'single',
      Solteiro: 'single',
      Solteira: 'single',
      'Casado(a)': 'married',
      Casado: 'married',
      Casada: 'married',
      'Divorciado(a)': 'divorced',
      'Viúvo(a)': 'widowed',
      'Viuvo(a)': 'widowed',
    };
    // Busca todos os clientes unificados da organização
    const customers = await this.prisma.customerUnified.findMany({
      where: { organization_id },
      select: { gender: true, marital_status: true, date_birth: true },
    });
    // Estatísticas de gênero
    const genderStats: Record<string, number> = {};
    // Estatísticas de estado civil
    const maritalStats: Record<string, number> = {};
    // Estatísticas de aniversariantes por mês
    const birthdayMonthStats: Record<number, number> = {};
    // Estatísticas por geração
    const generationStats: Record<string, number> = {};
    let total = customers.length;
    for (const c of customers) {
      // Gênero
      let g = c.gender ? genderMap[c.gender] || c.gender : 'Unknown';
      genderStats[g] = (genderStats[g] || 0) + 1;
      // Estado civil
      let m = c.marital_status ? maritalStatusMap[c.marital_status] || c.marital_status : 'Unknown';
      maritalStats[m] = (maritalStats[m] || 0) + 1;
      // Aniversariantes por mês
      if (c.date_birth) {
        const month = new Date(c.date_birth).getMonth() + 1; // Janeiro = 1, Dezembro = 12
        birthdayMonthStats[month] = (birthdayMonthStats[month] || 0) + 1;
        // Geração baseada no ano de nascimento
        const year = new Date(c.date_birth).getFullYear();
        let generation = 'Unknown';
        if (year >= 1946 && year <= 1964) {
          generation = 'Baby Boomers';
        } else if (year >= 1960 && year <= 1980) {
          generation = 'Geração X';
        } else if (year >= 1980 && year <= 2000) {
          generation = 'Geração Y (Millennials)';
        } else if (year >= 1990 && year <= 2010) {
          generation = 'Geração Z';
        } else if (year >= 2020) {
          generation = 'Geração Alpha';
        }
        generationStats[generation] = (generationStats[generation] || 0) + 1;
      }
    }
    // Monta o resultado
    return {
      total,
      gender: Object.entries(genderStats).map(([key, count]) => ({
        key,
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
      })),
      marital_status: Object.entries(maritalStats).map(([key, count]) => ({
        key,
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
      })),
      birthday_month: Object.entries(birthdayMonthStats).map(([month, count]) => ({
        month: Number(month),
        month_name: new Date(2024, Number(month) - 1).toLocaleDateString('pt-BR', { month: 'long' }),
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
      })),
      generations: Object.entries(generationStats).map(([key, count]) => ({
        key,
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
      })),
    };
  }
}
