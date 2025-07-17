import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOneLogin(username: string) {
    try {
      const userFind = await this.prisma.user.findUnique({
        where: {
          email: username,
        },
        include: {
          members: {
            select: {
              organization_id: true,
            },
          },
        },
      });
      if (!userFind) {
        throw new HttpException('por favor verifique usuario e senha', 401);
      }
      return userFind;
    } catch (error) {
      console.log(error);
    }
  }

  async updateLastAcess(id: number, organization_id: string) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
          organization_id,
        },
        data: {
          last_access: new Date(),
          updated_at: null,
        },
      });
      return {
        message: 'Ultima acesso atualizado com sucesso',
      };
    } catch (error) {
      console.log(error);
    }
  }
}
