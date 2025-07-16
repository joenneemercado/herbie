import { Module } from '@nestjs/common';
import { SellerchainService } from './sellerchain.service';
import { SellerchainController } from './sellerchain.controller';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  controllers: [SellerchainController],
  providers: [SellerchainService],
  imports: [DatabaseModule],
})
export class SellerchainModule {}
