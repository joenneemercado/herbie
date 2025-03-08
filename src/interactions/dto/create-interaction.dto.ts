import { json } from 'express';
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateInteractionDto {
    @IsString({ message: 'O organization_id deve ser um UUID válido' })
    @ApiProperty()
    organization_id: string;

    @IsString({ message: 'O type deve ser um número inteiro ' })
    @ApiProperty()
    type: string;

    @IsInt({ message: 'O event_id deve ser um número inteiro ' })
    @ApiProperty()
    event_id: number;

    @IsString({ message: 'O cpf deve ser válido' })
    @ApiProperty()
    cpf: string;

    @IsOptional({ message: 'O total do cliente é opcional' })
    @ApiProperty()
    total: number;

    @IsOptional({ message: 'json do cliente' })
    @ApiProperty()
    details: Record<string, any>;
}
