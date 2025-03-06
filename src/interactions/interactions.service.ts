import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { PrismaService } from '@src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { InteractionConstantes } from './interactions.constantes';
import { CreateInteractionSchema } from './dto/create-interaction-schema';

@Injectable()
export class InteractionsService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createInteractionDto: CreateInteractionSchema, req: Request) {
    //console.log('createInteractionDto', createInteractionDto)
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub, orgs } = await this.jwtService.decode(token);
      const {
        organization_id,
        cpf,
        event_id,
        //source_id,
        type
      } = createInteractionDto

      const findCustomerUnified = await this.prisma.customerUnified.findFirst({
        where: {
          cpf: cpf,
          organization_id: organization_id,
        },
      });

      const findUser = await this.prisma.customer.findFirst({
        where: {
          cpf: cpf,
          organization_id: organization_id,
          source_id: InteractionConstantes.SOURCE_ID_ZEUS
        },
      });

      if (!findUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }
      
      if (findCustomerUnified && findUser) {
        const createInteraction = await this.prisma.interaction.create({
          data: {
            organization_id: organization_id,
            details: createInteractionDto,
            customer_unified_Id: findCustomerUnified.id,
            customer_id: findUser.id,
            event_id: event_id,
            source_id: InteractionConstantes.SOURCE_ID_ZEUS,
            type: type,
          }
        })
        console.log('criando com customer unified', createInteraction)
      } else {
        const createInteraction = await this.prisma.interaction.create({
          data: {
            organization_id: organization_id,
            details: createInteractionDto,
            customer_id: findUser.id,
            event_id: event_id,
            source_id: InteractionConstantes.SOURCE_ID_ZEUS,
            type: type,
          }
        })
        console.log('cirando customer', createInteraction)
      }

      return {
        message: 'Interaction created successfully',
        code: HttpStatus.CREATED,
      }
    } catch (error) {
      console.log(error.message);
    }
    //return 'This action adds a new interaction';
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
