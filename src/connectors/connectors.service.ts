import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/database/prisma.service';

@Injectable()
export class ConnectorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const sources = await this.prisma.source.findMany();
      return sources;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
