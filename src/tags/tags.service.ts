import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '@src/database/prisma.service';
import { CreateContactTagsSchema } from './dto/tag.schema';
import { JwtService } from '@nestjs/jwt';
import { HttpStatusCode } from 'axios';

@Injectable()
export class TagsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  async createTagContact(
    createContactTagsDto: CreateContactTagsSchema,
    req: Request,
  ) {
    //console.log('createContactTagsDto', createContactTagsDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    const token = reqToken.split(' ')[1];
    //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
    const { sub } = await this.jwtService.decode(token);

    const findTag = await this.prisma.tags.findFirst({
      where: {
        id: createContactTagsDto.idTag,
        organization_id: createContactTagsDto.organization_id,
      },
    });
    if (!findTag) {
      throw new HttpException('tag nao existe', 404);
    }

    const findTagContact = await this.prisma.associationTags.findFirst({
      where: {
        tag_id: createContactTagsDto.idTag,
        customer_unified_id: createContactTagsDto.customer_unified_id,
        organization_id: createContactTagsDto.organization_id,
      },
    });
    if (findTagContact) {
      return {
        code: HttpStatusCode.Conflict,
        sucesse: false,
        message: `tagId: ${findTag.id} ja existe para o contato: ${findTagContact.customer_unified_id}`,
      };
    }
    if (!findTagContact) {
      await this.prisma.associationTags.create({
        data: {
          tag_id: createContactTagsDto.idTag,
          organization_id: createContactTagsDto.organization_id,
          created_by: sub,
          customer_unified_id: createContactTagsDto.customer_unified_id,
        },
      });
      //console.log('create', create);
    }
    return {
      code: HttpStatus.CREATED,
      success: true,
      message: 'tagId associada ao contato com sucesso',
    };
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  async deleteTagContact(
    createContactTagsDto: CreateContactTagsSchema,
    req: Request,
  ) {
    //console.log('createContactTagsDto', createContactTagsDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }

    const findTagContact = await this.prisma.associationTags.findFirst({
      where: {
        tag_id: createContactTagsDto.idTag,
        customer_unified_id: createContactTagsDto.customer_unified_id,
        organization_id: createContactTagsDto.organization_id,
      },
    });
    if (findTagContact) {
      await this.prisma.associationTags.delete({
        where: {
          id: findTagContact.id,
        },
      });
      return {
        status: HttpStatus.CREATED,
        success: true,
        message: 'tagId excluida do contato com sucesso',
      };
    }
  }
}
