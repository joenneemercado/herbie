import { Module } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { DatabaseModule } from '@src/database/database.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule],
  controllers: [InteractionsController],
  providers: [InteractionsService, JwtService],
})
export class InteractionsModule {}
