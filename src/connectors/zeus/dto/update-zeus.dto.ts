import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

//export class UpdateZeusDto extends PartialType(CreateZeusDto) {}
export class UpdateEnderecoZeusDto {
    // @IsString( { message: 'O organization_id deve ser um UUID válido' })
    // @ApiProperty()
    // organization_id: string;

    @IsString({ message: 'O cep ser válido' })
    @ApiProperty()
    cep: string;

    @IsString({ message: 'O endereco deve do cliente' })
    @ApiProperty()
    endereco: string;

    @IsString({ message: 'O complemento do enderco' })
    @ApiProperty()
    complemento: string;

    @IsOptional()
    @IsString({ message: 'O bairro do cliente' })
    @ApiProperty()
    bairro?: string;

    @IsOptional()
    @IsNumber({}, { message: 'O número da residência' })
    @ApiProperty()
    numero?: number;

    @IsOptional()
    @IsString({ message: 'A regiao UF do cliente' })
    @ApiProperty()
    UF?: string;

    @IsString({ message: 'A cidade do cliente' })
    @ApiProperty()
    cidade: string;

    @IsString({ message: 'Complemento do cliente' })
    @ApiProperty()
    complemet: string;
}
export class UpdateZeusDto {

    @IsNumber({}, { message: 'id do cliente' })
    @ApiProperty()
    id: number;

    @IsOptional()
    @IsString({ message: 'O name do cliente' })
    @ApiProperty()
    name: string;

    @IsOptional()
    @IsString({ message: 'O email deve ser válido' })
    @ApiProperty()
    email: string;

    @IsOptional()
    @IsString({ message: 'O celular deve ser válido' })
    @ApiProperty()
    celular: string;

    @IsOptional()
    @IsString({ message: 'O genero do cliente' })
    @ApiProperty()
    genero?: string;

    @IsOptional()
    @IsString({ message: 'O estato_civil do cliente' })
    @ApiProperty()
    estato_civil?: string;

    @IsOptional()
    @IsString({ message: 'A data de nascimento do cliente' })
    @ApiProperty()
    data_nascimento?: string;

    @IsString({ message: 'O cpf deve ser válido' })
    @ApiProperty()
    cpf: string;

    @IsOptional()
    @ApiProperty()
    endereco?: UpdateEnderecoZeusDto;
}