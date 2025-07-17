import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateRfmsegmentationDto } from './dto/create-rfmsegmentation.dto';
import { UpdateRfmsegmentationDto } from './dto/update-rfmsegmentation.dto';
import { FindRfmSegmentationchema } from './dto/rfmsegmentation-schema';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class RfmsegmentationService {
  constructor(private prisma: PrismaService) {}
  create(createRfmsegmentationDto: CreateRfmsegmentationDto) {
    return 'This action adds a new rfmsegmentation';
  }

  async findAll(
    findRfmSegmentationchema: FindRfmSegmentationchema,
    req: Request,
  ) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    return await this.prisma.rFMSegmentation.findMany({
      where: {
        organization_id: findRfmSegmentationchema.organization_id,
      },
    });
    //return `This action returns all rfmsegmentation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rfmsegmentation`;
  }

  update(id: number, updateRfmsegmentationDto: UpdateRfmsegmentationDto) {
    return `This action updates a #${id} rfmsegmentation`;
  }

  remove(id: number) {
    return `This action removes a #${id} rfmsegmentation`;
  }
}
