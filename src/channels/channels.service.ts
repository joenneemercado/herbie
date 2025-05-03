import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { FindChannelchema } from './dto/channels.schema';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}
  create(createChannelDto: CreateChannelDto) {
    return 'This action adds a new channel';
  }

  async findAll(findChannelDto: FindChannelchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      //console.log(findSourceDto);
      const skip = (findChannelDto.page - 1) * findChannelDto.limit;
      const limit = Number(findChannelDto.limit) || 10;
      const page = Number(findChannelDto.page) || 1;
      const filtersChannel = [];
      if (findChannelDto.id) {
        filtersChannel.push({ id: findChannelDto.id });
      }
      if (findChannelDto.status_id) {
        filtersChannel.push({ status_id: findChannelDto.status_id });
      }
      const whereConditionChannel = {
        AND: [...filtersChannel],
      };
      const data = await this.prisma.channels.findMany({
        where: {
          organization_id: findChannelDto.organization_id,
          ...whereConditionChannel,
        },
        select: {
          id: true,
          name: true,
          status_id: true,
        },
        skip: skip,
        take: limit,
      });
      const total = await this.prisma.channels.count({
        where: {
          organization_id: findChannelDto.organization_id,
          ...whereConditionChannel,
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
    return `This action returns a #${id} channel`;
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {
    return `This action updates a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
