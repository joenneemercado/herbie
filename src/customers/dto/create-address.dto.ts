import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  address_ref: string;

  @ApiProperty()
  neighborhood: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  country?: string;

  @ApiProperty()
  postal_code: string;

  @ApiProperty()
  address_type: string;

  @ApiProperty()
  is_default?: boolean;

  @ApiProperty()
  organization_id: string;

  @ApiProperty()
  customer_id: string;
}
