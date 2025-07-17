import { PartialType } from '@nestjs/mapped-types';
import { CreateRfmsegmentationDto } from './create-rfmsegmentation.dto';

export class UpdateRfmsegmentationDto extends PartialType(CreateRfmsegmentationDto) {}
