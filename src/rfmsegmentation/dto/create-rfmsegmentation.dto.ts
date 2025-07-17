import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRfmsegmentationDto {}

export class FindRfmSegmentationDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;
}
