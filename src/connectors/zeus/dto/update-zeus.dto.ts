import { PartialType } from '@nestjs/swagger';
import { CreateZeusDto } from './create-zeus.dto';

export class UpdateZeusDto extends PartialType(CreateZeusDto) {}
