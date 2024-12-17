import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UsersService {

  constructor(
    private readonly prisma: PrismaService,

  ) {}


  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
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
}
