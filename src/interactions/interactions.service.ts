import { Injectable } from '@nestjs/common';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { PrismaService } from '@src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

@Injectable()
export class InteractionsService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  create(createInteractionDto: CreateInteractionDto) {
    return 'This action adds a new interaction';
  }

  async findAll(params: {
    page: number;
    limit: number;
    organization_id: string;
    customer_id?: number;
  }) {
    const { page, limit, organization_id, customer_id } = params;
    const skip = (page - 1) * limit;

    const filters: Prisma.InteractionWhereInput = {
      AND: [
        customer_id ? { customer_id: customer_id } : {},
        organization_id
          ? { organization_id: organization_id }
          : { organization_id: organization_id },
      ],
    };

    try {
      const [result, total] = await Promise.all([
        this.prisma.interaction.findMany({
          skip,
          take: Number(limit),
          where: filters,
          orderBy: {
            created_at: 'desc',
          },
        }),
        this.prisma.interaction.count({ where: filters }),
      ]);

      return {
        data: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching customers Unified:', error);
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} interaction`;
  }

  update(id: number, updateInteractionDto: UpdateInteractionDto) {
    return `This action updates a #${id} interaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} interaction`;
  }
}
