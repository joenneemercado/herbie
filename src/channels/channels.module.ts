import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsService],
  imports: [DatabaseModule],
})
export class ChannelsModule {}
