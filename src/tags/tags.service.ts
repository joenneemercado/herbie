import { HttpException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '@src/database/prisma.service';
import { boolean } from 'zod';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  // create(createTagDto: CreateTagDto) {
  //   return 'This action adds a new tag';
  // }
  async create(body: {
    name: string;
    createdBy: number;
    organization_id: string;
  }) {
    const { organization_id, name, createdBy } = body;
    try {
      const existingtag = await this.prisma.tags.findFirst({
        where: {
          name: name,
          organization_id: organization_id,
        },
      });
      if (existingtag) {
        throw new HttpException('tag já existe', 409);
      }

      const tag = await this.prisma.tags.create({
        data: {
          name: name,
          organization_id: organization_id,
          created_by: createdBy,
        },
      });
      return tag;
    } catch (error) {
      console.log(`erro ao criar tag`, error);
      throw new HttpException(error.message, error.status);
    }

    //return 'This action adds a new tag';
  }

  async createTagCustomer(Body: {
    idTag: number;
    idCustomer?: number;
    idCampaing?: number;
    createdBy: number;
    organization_id: string;
  }) {
    const { organization_id, idTag, createdBy, idCustomer, idCampaing } = Body;
    try {
      const existingtag = await this.prisma.associationTags.findFirst({
        where: {
          tag_id: idTag,
          organization_id: organization_id,
        },
      });
      if (existingtag) {
        throw new HttpException('id tag já existe', 409);
      }
      const tag = await this.prisma.associationTags.create({
        data: {
          tag_id: idTag,
          organization_id: organization_id,
          created_by: createdBy ? createdBy : 1,
          customer_id: idCustomer,
          campaing_id: idCampaing,
        },
      });

      return tag;
    } catch (error) {
      console.log(`erro ao associar criar tag`, error);
      throw new HttpException(error.message, error.status);
    }

    //return 'This action adds a new tag';
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    organization_id: string;
    name?: string;
    createdBy?: number;
  }) {
    const { page, limit, organization_id, name, createdBy } = params;

    const skip = (page - 1) * limit;
    const filters: any = {
      AND: [
        organization_id && { organization_id },
        name && { name: { contains: name, mode: 'insensitive' as const } },
        createdBy && { created_by: createdBy },
      ].filter(Boolean),
    };
    try {
      const [tags, total] = await Promise.all([
        this.prisma.tags.findMany({
          skip,
          take: Number(limit),
          where: filters,
        }),
        this.prisma.tags.count({ where: filters }),
      ]);
      return {
        data: tags,
        pageInfo: {
          totalItems: total,
          currentPage: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.log(`erro ao procurar tags `, error);
      throw new HttpException(error.message, error.status);
    }
  }

  async findOne(id: number, organization_id: string) {
    try {
      //console.log(id,organization_id)
      const tags = await this.prisma.tags.findFirst({
        where: {
          id: id,
          organization_id: organization_id,
        },
      });
      if (!tags) {
        throw new HttpException('tag nao existe', 404);
      }
      return tags;
    } catch (error) {
      console.log(`erro ao procurar tag`, error);
      throw new HttpException(error.message, error.status);
    }
    //return `This action returns a #${id} tag`;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
