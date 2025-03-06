
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateZeusDto } from './dto/update-zeus.dto';
import { PrismaService } from '@src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateZeusArraySchema, CreateZeusSchema } from './dto/create-zeus-schema';

@Injectable()
export class ZeusService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async create(createZeusDto: CreateZeusSchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = reqToken.split(' ')[1];
      //const decodedToken = this.jwtService.decode(token) as { sub: number, org: string };
      const { sub, orgs } = await this.jwtService.decode(token);
      const {
        organization_id,
        name,
        phone,
        cpf,
        email,
        date_birth,
        marital_status,
        gender,
        address: {
          postal_code,
          street,
          complement,
          city,
          neighborhood,
          number,
          state
        }
      } = createZeusDto;

      const userCustumer = await this.prisma.customer.findFirst({
        where: {
          cpf: cpf,
          organization_id: organization_id,
          source_id: 3
        },
      });
      if (userCustumer) {
        return {
          code: 409,
          success: false,
          message: "Customer exists",
        };
      }

       await this.prisma.customer.create({
        data: {
          organization_id: organization_id,
          firstname: name,
          lastname: null,
          nickname: null,
          email: email,
          phone: phone,
          cpf: cpf,
          cnpj: null,
          company_name: null,
          trading_name: null,
          date_birth: date_birth,
          marital_status: marital_status,
          gender: gender,
          created_by: sub,
          source_id: 3,
          addresses: {
            create: {
              organization_id: organization_id,
              postal_code,
              street,
              number,
              city,
              neighborhood,
              state,
              complement
            }
          }
        },
      });

      return { 
        code:HttpStatus.CREATED,
        success: true,
        //message:"sucess"
       }

    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }


  async createListCustumers(createZeusDto: CreateZeusArraySchema, req: Request) {
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = reqToken.split(' ')[1];
      const { sub, orgs } = await this.jwtService.decode(token);
      const dados = []
      for (const dto of createZeusDto) {
        const data = {
          organization_id: dto.organization_id,
          firstname: dto.name,
          lastname: null,
          nickname: null,
          email: dto.email,
          phone: dto.phone,
          cpf: dto.cpf,
          cnpj: null,
          company_name: null,
          trading_name: null,
          date_birth: dto.date_birth,
          marital_status: dto.marital_status,
          gender: dto.gender,
          created_by: sub,
          source_id: 3,
        }
        dados.push(data)
      }
      const dadosEnderecos = []
      await this.prisma.$transaction(
       async (trx) =>{
          const createCustomer = await trx.customer.createManyAndReturn({
            select:{public_id:true,cpf:true},
            data: dados,
            skipDuplicates: true,
          })
          for (const dto of createZeusDto) {
            const data = {
              customer_id: createCustomer.find(c => c.cpf === dto.cpf)?.public_id,
              organization_id: dto.organization_id,
              postal_code: dto.address.postal_code,
              street: dto.address.street,
              number: dto.address.number,
              city: dto.address.city,
              neighborhood: dto.address.neighborhood,
              state: dto.address.state,
              complement: dto.address.complement
            }
            if(!data.customer_id){
              //console.log(data)
              continue
            }
            dadosEnderecos.push(data)
          }
           await trx.address.createMany({
            data: dadosEnderecos,
            skipDuplicates: true,
          });
        }
      )
       return { 
        code:HttpStatus.CREATED,
        success: true,
        //message:"sucess"
       }

    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  findAll() {
    return `This action returns all zeus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} zeus`;
  }

  update(id: number, updateZeusDto: UpdateZeusDto) {
    return `This action updates a #${id} zeus`;
  }

  remove(id: number) {
    return `This action removes a #${id} zeus`;
  }
}
