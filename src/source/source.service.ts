import { Injectable } from '@nestjs/common';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class SourceService {
  constructor(private prisma: PrismaService) {}
  create(createSourceDto: CreateSourceDto) {
    return 'This action adds a new source';
  }

  async findAll() {
    try {
      const sources = await this.prisma.source.findMany();
      return sources;
    } catch (error) {
      throw new Error('Failed to retrieve sources');
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
