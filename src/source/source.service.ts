import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { PrismaService } from '@src/database/prisma.service';
import { FindSourcechema } from './dto/source.schema';

@Injectable()
export class SourceService {
  constructor(private prisma: PrismaService) {}
  create(createSourceDto: CreateSourceDto) {
    return 'This action adds a new source';
  }

  // async findAll() {
  //   try {
  //     const sources = await this.prisma.source.findMany();
  //     return sources;
  //   } catch (error) {
  //     throw new Error('Failed to retrieve sources');
  //   }
  // }

  async findAll(findSourceDto: FindSourcechema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      //console.log(findSourceDto);
      const skip = (findSourceDto.page - 1) * findSourceDto.limit;
      const limit = Number(findSourceDto.limit) || 10;
      const page = Number(findSourceDto.page) || 1;
      const filtersSource = [];
      if (findSourceDto.id) {
        filtersSource.push({ id: findSourceDto.id });
      }
      if (findSourceDto.status_id) {
        filtersSource.push({ status_id: findSourceDto.status_id });
      }
      const whereConditionSource = {
        AND: [...filtersSource],
      };
      const data = await this.prisma.source.findMany({
        where: {
          ...whereConditionSource,
        },
        select: {
          id: true,
          name: true,
          status_id: true,
        },
        skip: skip,
        take: limit,
      });
      const total = await this.prisma.source.count({
        where: {
          ...whereConditionSource,
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
    return `This action returns a #${id} source`;
  }

  update(id: number, updateSourceDto: UpdateSourceDto) {
    return `This action updates a #${id} source`;
  }

  remove(id: number) {
    return `This action removes a #${id} source`;
  }
}
