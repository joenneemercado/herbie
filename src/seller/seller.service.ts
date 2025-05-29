import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { FindSellerschema } from './dto/seller.schema';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class SellerService {
  constructor(private prisma: PrismaService) {}
  create(createSellerDto: CreateSellerDto) {
    return 'This action adds a new seller';
  }

  async findAll(findSellerDto: FindSellerschema, req: Request) {
    //console.log(findSellerDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const skip = (findSellerDto.page - 1) * findSellerDto.limit;
      const limit = Number(findSellerDto.limit) || 10;
      const page = Number(findSellerDto.page) || 1;
      const filtersSeller = [];
      if (findSellerDto.ref) {
        filtersSeller.push({ id: findSellerDto.ref });
      }
      if (findSellerDto.name) {
        filtersSeller.push({ name: findSellerDto.name });
      }
      const whereConditionSeller = {
        AND: [...filtersSeller],
      };
      const data = await this.prisma.seller.findMany({
        where: {
          ...whereConditionSeller,
        },
        select: {
          id: true,
          name: true,
          seller_ref: true,
          neighborhood: true,
          street: true,
          city: true,
          created_at: true,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      });
      const total = await this.prisma.seller.count({
        where: {
          ...whereConditionSeller,
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
      console.log(error);
      throw error('Failed to retrieve sellers');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} seller`;
  }

  update(id: number, updateSellerDto: UpdateSellerDto) {
    return `This action updates a #${id} seller`;
  }

  remove(id: number) {
    return `This action removes a #${id} seller`;
  }
}
