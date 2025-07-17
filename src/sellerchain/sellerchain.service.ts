import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateSellerchainDto } from './dto/create-sellerchain.dto';
import { UpdateSellerchainDto } from './dto/update-sellerchain.dto';
import { FindSellerChainchema } from './dto/sellerchain-schema';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class SellerchainService {
  constructor(private prisma: PrismaService) {}
  create(createSellerchainDto: CreateSellerchainDto) {
    return 'This action adds a new sellerchain';
  }

  async findAll(findSellerChainchema: FindSellerChainchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    return await this.prisma.sellerChain.findMany({
      where: {
        organization_id: findSellerChainchema.organization_id,
      },
    });
    //return `This action returns all sellerchain`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sellerchain`;
  }

  update(id: number, updateSellerchainDto: UpdateSellerchainDto) {
    return `This action updates a #${id} sellerchain`;
  }

  remove(id: number) {
    return `This action removes a #${id} sellerchain`;
  }
}
