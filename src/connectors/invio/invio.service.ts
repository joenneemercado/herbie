import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateInvioDto } from './dto/create-invio.dto';
import { UpdateInvioDto } from './dto/update-invio.dto';
import { FindAllInvioDtoDtoSchema } from './dto/invio-schema';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { InvioConstantes } from './invio.constantes';

@Injectable()
export class InvioService {
  private http = new HttpService();

  create(createInvioDto: CreateInvioDto) {
    return 'This action adds a new invio';
  }

  async findAll(findAllInvioDto: FindAllInvioDtoDtoSchema, req: Request) {
    //console.log(findAllInvioDto);
    const reqToken = req.headers['authorization'];
    if (!reqToken) {
      throw new UnauthorizedException();
    }

    const API_URL = `${InvioConstantes.TEMPLATE}`;
    const TOKEN = process.env.TOKEN_INVIO;

    const queryParams = {
      ChannelId: findAllInvioDto.channelId,
      Name: findAllInvioDto.name,
      pagesize: findAllInvioDto.limit,
      pageNumber: findAllInvioDto.page,
    };
    // const queryString = Object.keys(queryParams)
    //   .map(
    //     (key) =>
    //       `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
    //   )
    //   .join('&');

    //const finalUrl = `${API_URL}?${queryString}`;
    //console.log('URL final da requisição:', finalUrl);

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      params: queryParams,
    });
    // console.log(response.data);
    const dado = response.data;

    return dado;
  }

  findOne(id: number) {
    return `This action returns a #${id} invio`;
  }

  update(id: number, updateInvioDto: UpdateInvioDto) {
    return `This action updates a #${id} invio`;
  }

  remove(id: number) {
    return `This action removes a #${id} invio`;
  }
}
