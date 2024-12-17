import { Controller } from '@nestjs/common';
import { SkusService } from './skus.service';

@Controller('skus')
export class SkusController {
  constructor(private readonly skusService: SkusService) {}
}
