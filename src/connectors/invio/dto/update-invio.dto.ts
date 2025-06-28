import { PartialType } from '@nestjs/mapped-types';
import { CreateInvioDto } from './create-invio.dto';

export class UpdateInvioDto extends PartialType(CreateInvioDto) {}
