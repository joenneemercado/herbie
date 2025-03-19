import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ProductDetailsZeusDto {
  @IsNumber({}, { message: 'O  valor_cashback deve ser um número' })
  @ApiProperty({ description: 'Valor do cashback', example: 10.5 })
  valor_cashback: number;

  @IsNumber({}, { message: 'O valor deve ser um número' })
  @ApiProperty({ description: 'Valor do produto', example: 50.0 })
  valor: number;

  @IsString({ message: 'O codigoEAN deve ser uma string' })
  @ApiProperty({
    description: 'Código EAN do produto',
    example: '7891234567890',
  })
  codigoEAN: string;

  @IsString({ message: 'O código deve ser uma string' })
  @ApiProperty({ description: 'Código interno do produto', example: 'P001' })
  codigo: string;

  @IsString({ message: 'A unidade deve ser uma string' })
  @ApiProperty({ description: 'Unidade de medida do produto', example: 'UN' })
  unidade: string;

  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @ApiProperty({ description: 'Quantidade do produto', example: 2 })
  quantidade: number;

  @IsString({ message: 'A descrição deve ser uma string' })
  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Smartphone XYZ',
  })
  descricao: string;
}

export class InteractionDetailsZeusDto {
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

  @IsNumber({}, { message: 'O vlCash deve ser um número' })
  @ApiProperty({ description: 'Valor de cashback acumulado', example: 5.75 })
  vlCash: number;

  // @IsNumber({}, { message: 'O percCashPadrao deve ser um número' })
  // @ApiProperty({ description: 'Percentual de cashback padrão', example: 3.5 })
  // percCashPadrao: number;

  // @IsNumber({}, { message: 'O idOperador deve ser um número' })
  // @ApiProperty({
  //   description: 'Identificação do operador de caixa',
  //   example: 101,
  // })
  // idOperador: number;

  // @IsDateString({}, { message: 'A dataMovHr deve ser uma data válida' })
  // @ApiProperty({
  //   description: 'Data e hora do movimento de caixa',
  //   example: '2024-05-10T14:00:00.000Z',
  // })
  // dataMovHr: string;

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
  rede: string;

  @IsNumber({}, { message: 'O qtProd deve ser um número' })
  @ApiProperty({ description: 'Quantidade de produtos na compra', example: 10 })
  qtProd: number;

  @IsString({ message: 'cashAtacac deve ser uma string válida.' })
  @ApiProperty({
    description: 'Cashback em atacado',
    example: 'S',
  })
  cashAtacac: string;

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

  @IsArray()
  @ApiProperty({
    description: 'Lista de produtos comprados',
    type: [ProductDetailsZeusDto],
  })
  produtos: ProductDetailsZeusDto[];
}

export class CreateInteractionZeusDto {
  @IsString({ message: 'O organization_id deve ser um UUID válido' })
  @ApiProperty()
  organization_id: string;

  //   @IsString({ message: 'O type deve ser uma string ' })
  //   @ApiProperty()
  //   type: string;

  //   @IsInt({ message: 'O event_id deve ser um número inteiro ' })
  //   @ApiProperty()
  //   event_id: number;

  @IsOptional()
  @IsString({ message: 'O cpf deve ser válido' })
  @ApiProperty()
  cpf?: string;

  @IsOptional()
  @IsString({ message: 'O cnpj deve ser válido' })
  @ApiProperty()
  cnpj?: string;

  @IsOptional({ message: 'O total do cliente é opcional' })
  @ApiProperty()
  total: number;

  @IsOptional({ message: 'json do cliente' })
  @ApiProperty()
  details: InteractionDetailsZeusDto;
}
