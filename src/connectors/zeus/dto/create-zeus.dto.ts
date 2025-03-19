import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateEnderecoZeusDto {
  @IsString({ message: 'O cep ser válido' })
  @ApiProperty()
  postal_code: string;

  @IsString({ message: 'O endereco deve do cliente' })
  @ApiProperty()
  street: string;

  @IsString({ message: 'O bairro do cliente' })
  @ApiProperty()
  neighborhood: string;

  @IsString({ message: 'O número da residência' })
  @ApiProperty()
  number: string;

  @IsString({ message: 'A regiao UF do cliente' })
  @ApiProperty()
  state: string;

  @IsString({ message: 'A cidade do cliente' })
  @ApiProperty()
  city: string;

  @IsString({ message: 'O  nome do pais' })
  @ApiProperty()
  country: string;

  @IsOptional()
  @IsString({ message: 'Complemento do cliente' })
  @ApiProperty()
  complemet?: string;
}

export class CreateClienteZeusDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsString({ message: 'O name do cliente' })
  @ApiProperty()
  name: string;

  @IsEmail({}, { message: 'O email deve ser válido' })
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

  @IsOptional()
  @IsString({ message: 'O cpf deve ser válido' })
  @ApiProperty()
  cpf?: string;

  @IsOptional()
  @IsString({ message: 'O cnpj deve ser válido' })
  @ApiProperty()
  cnpj?: string;

  @IsDateString({}, { message: 'A date_of_inclusion deve ser uma data válida' })
  @ApiProperty({
    description: 'Data de inclusão do cadastro',
    example: '2024-01-10T00:00:00.000Z',
  })
  date_of_inclusion: string | Date;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'A data que o cliente concluiu o cadastro deve ser uma data válida',
    },
  )
  @ApiProperty({
    description: 'Data que concluiu o cadastro',
    example: '2024-01-10T00:00:00.000Z',
  })
  date_registration_full?: string;

  // @IsString({ message: 'O idClienteZeus deve ser unico' })
  // @ApiProperty({
  //   description: 'Identificação única do cliente no banco de dados',
  // })
  // idClienteZeus: string;

  @IsOptional()
  @ApiProperty()
  address?: CreateEnderecoZeusDto;
}
