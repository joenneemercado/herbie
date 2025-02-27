import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, } from "class-validator";

export class CreateEnderecoZeusDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsOptional()
  @IsString({ message: 'O cep ser válido' })
  @ApiProperty()
  postal_code?: string;

  @IsOptional()
  @IsString({ message: 'O endereco deve do cliente' })
  @ApiProperty()
  street?: string;

  @IsOptional()
  @IsString({ message: 'O bairro do cliente' })
  @ApiProperty()
  neighborhood?: string;

  @IsOptional()
  @IsString({ message: 'O número da residência' })
  @ApiProperty()
  number?: string;

  @IsOptional()
  @IsString({ message: 'A regiao UF do cliente' })
  @ApiProperty()
  state?: string;

  @IsOptional()
  @IsString({ message: 'A cidade do cliente' })
  @ApiProperty()
  city?: string;

  @IsOptional()
  @IsString({ message: 'Complemento do cliente' })
  @ApiProperty()
  complemet?: string;
}
export class CreateZeusDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsString({ message: 'O name do cliente' })
  @ApiProperty()
  name: string;

  @IsString({ message: 'O email deve ser válido' })
  @ApiProperty()
  email: string;

  @IsString({ message: 'O celular deve ser válido' })
  @ApiProperty()
  phone: string;

  @IsOptional()
  @IsString({ message: 'O genero do cliente' })
  @ApiProperty()
  gender?: string;

  @IsOptional()
  @IsString({ message: 'O estato_civil do cliente' })
  @ApiProperty()
  marital_status?: string;

  @IsOptional()
  @IsString({ message: 'A data de nascimento do cliente' })
  @ApiProperty()
  date_birth?: string;

  @IsString({ message: 'O cpf deve ser válido' })
  @ApiProperty()
  cpf: string;

  @IsOptional()
  @ApiProperty()
  address?: CreateEnderecoZeusDto;
}

