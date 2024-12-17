import { Injectable } from '@nestjs/common';
import { CreateZeusDto } from './dto/create-zeus.dto';
import { UpdateZeusDto } from './dto/update-zeus.dto';

@Injectable()
export class ZeusService {
  create(createZeusDto: CreateZeusDto) {
    return 'This action adds a new zeus';
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
