import { Controller } from '@nestjs/common';
import { AdressesService } from './adresses.service';

@Controller('adresses')
export class AdressesController {
  constructor(private readonly adressesService: AdressesService) {}
}
