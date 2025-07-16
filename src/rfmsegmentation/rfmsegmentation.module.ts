import { Module } from '@nestjs/common';
import { RfmsegmentationService } from './rfmsegmentation.service';
import { RfmsegmentationController } from './rfmsegmentation.controller';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  controllers: [RfmsegmentationController],
  providers: [RfmsegmentationService],
  imports: [DatabaseModule],
})
export class RfmsegmentationModule {}
