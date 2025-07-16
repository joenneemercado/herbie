import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerchainDto } from './create-sellerchain.dto';

export class UpdateSellerchainDto extends PartialType(CreateSellerchainDto) {}
