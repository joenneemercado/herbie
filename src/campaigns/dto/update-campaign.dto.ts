import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCampaignDto {
  @IsNumber()
  @ApiProperty({ description: 'ID da campanha', example: 1 })
  id: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Prioridade da campanha', example: 1 })
  priority: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Status do campanha', example: 1 })
  status_id: number;

  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty({ example: 'cm0l1u61r00003b6junq2pmbi' })
  organization_id: string;
}
