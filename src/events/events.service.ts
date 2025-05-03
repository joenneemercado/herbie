import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from '@src/database/prisma.service';
import { FindEventchema } from './dto/events.schema';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}
  create(createEventDto: CreateEventDto) {
    return 'This action adds a new event';
  }

  async findAll(findEventDto: FindEventchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      //console.log(findSourceDto);
      const skip = (findEventDto.page - 1) * findEventDto.limit;
      const limit = Number(findEventDto.limit) || 10;
      const page = Number(findEventDto.page) || 1;
      const filtersEvent = [];
      if (findEventDto.id) {
        filtersEvent.push({ id: findEventDto.id });
      }
      const whereConditionEvent = {
        AND: [...filtersEvent],
      };
      const data = await this.prisma.event.findMany({
        where: {
          organization_id: findEventDto.organization_id,
          ...whereConditionEvent,
        },
        select: {
          id: true,
          name: true,
          type_event: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        skip: skip,
        take: limit,
      });
      const total = await this.prisma.event.count({
        where: {
          ...whereConditionEvent,
        },
      });

      const totalPages = Math.ceil(total / limit);
      return {
        data,
        pageInfo: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(`erro ao buscar os sources`, error);
      throw new HttpException(error.message, error.status);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
