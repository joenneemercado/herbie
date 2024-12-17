import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SkusModule } from './skus/skus.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [SkusModule],
})
export class ProductsModule {}
