import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsString({ message: 'O cpf deve ser válido' })
  @ApiProperty()
  cpf: string;

  @IsDateString({}, { message: 'A dataInclusao deve ser uma data válida' })
  @ApiProperty({
    description: 'Data de inclusão do cadastro',
    example: '2024-01-10T00:00:00.000Z',
  })
  dataInclusao: string;

  @IsString({ message: 'O idClienteZeus deve ser unico' })
  @ApiProperty({
    description: 'Identificação única do cliente no banco de dados',
  })
  idClienteZeus: string;

  @IsOptional()
  @ApiProperty()
  address?: CreateEnderecoZeusDto;
}

export class InteractionAcumularDetailsZeusDto {
  @IsString({ message: 'O idVenda deve ser um string' })
  @ApiProperty({ description: 'Identificação única da venda', example: 123456 })
  idVenda: string;

  @IsNumber({}, { message: 'O vlCupom deve ser um número' })
  @ApiProperty({ description: 'Valor total do cupom', example: 150.75 })
  vlCupom: number;

  @IsDateString({}, { message: 'A dataVenda deve ser uma data válida' })
  @ApiProperty({
    description: 'Data da venda',
    example: '2024-05-10T12:30:00.000Z',
  })
  dataVenda: string;

  @IsString({ message: 'A serie deve ser uma string' })
  @ApiProperty({ description: 'Série do cupom fiscal', example: 'A1' })
  serie: string;

  @IsNumber({}, { message: 'O loja deve ser um string' })
  @ApiProperty({
    description: 'Identificação única da loja',
    example: 'Loja 1',
  })
  loja: string;

  @IsString({ message: 'O celular deve ser uma string válida' })
  @ApiProperty({
    description: 'Número de celular do cliente',
    example: '+5511912345678',
  })
  celular: string;

  @IsDateString({}, { message: 'A dataIntegracao deve ser uma data válida' })
  @ApiProperty({
    description: 'Data de integração da venda',
    example: '2024-05-11T10:15:00.000Z',
  })
  dataIntegracao: string;

  @IsString({ message: 'O tipoVlItem deve ser uma string' })
  @ApiProperty({
    description: 'Tipo de valor do item deve ser TOTAL ou UNITARIO',
    example: 'TOTAL',
  })
  tipoVlItem: string;

  @IsNumber({}, { message: 'O vlCash deve ser um número' })
  @ApiProperty({ description: 'Valor de cashback acumulado', example: 5.75 })
  vlCash: number;

  @IsNumber({}, { message: 'O percCashPadrao deve ser um número' })
  @ApiProperty({ description: 'Percentual de cashback padrão', example: 3.5 })
  percCashPadrao: number;

  @IsNumber({}, { message: 'O idOperador deve ser um número' })
  @ApiProperty({
    description: 'Identificação do operador de caixa',
    example: 101,
  })
  idOperador: number;

  @IsDateString({}, { message: 'A dataMovHr deve ser uma data válida' })
  @ApiProperty({
    description: 'Data e hora do movimento de caixa',
    example: '2024-05-10T14:00:00.000Z',
  })
  dataMovHr: string;

  @IsBoolean({ message: 'O primeiraCompra deve ser um booleano' })
  @ApiProperty({
    description: 'Indica se é a primeira compra do cliente',
    example: true,
  })
  primeiraCompra: boolean;

  @IsString({ message: 'O idRede deve ser uma string' })
  @ApiProperty({
    description: 'Identificação da rede de lojas',
    example: 'Rede 1',
  })
  rede: number;

  @IsNumber({}, { message: 'O qtProd deve ser um número' })
  @ApiProperty({ description: 'Quantidade de produtos na compra', example: 10 })
  qtProd: number;

  @IsNumber({}, { message: 'O cashAtacac deve ser um número' })
  @ApiProperty({ description: 'Cashback em atacado', example: 8.5 })
  cashAtacac: number;

  @IsString({ message: 'O tipoPessoa deve ser uma string' })
  @ApiProperty({
    description: 'Tipo de pessoa (Física ou Jurídica)',
    example: 'F',
  })
  tipoPessoa: string;

  @IsNumber({}, { message: 'O qtUnidades deve ser um número' })
  @ApiProperty({
    description: 'Quantidade total de unidades compradas',
    example: 20,
  })
  qtUnidades: number;

  @IsNumber({}, { message: 'O vlTroco deve ser um número' })
  @ApiProperty({ description: 'Valor do troco da compra', example: 2.75 })
  vlTroco: number;
}

export class CreateInteractionAcumularZeusDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  @IsString({ message: 'O type deve ser uma string ' })
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
  details: InteractionAcumularDetailsZeusDto;
}
