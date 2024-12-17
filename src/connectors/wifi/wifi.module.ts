import { forwardRef, Module } from '@nestjs/common';
import { WifiService } from './wifi.service';
import { WifiController } from './wifi.controller';
import { DatabaseModule } from '@src/database/database.module';
import { QueueModule } from '@src/queue/queue.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => QueueModule)],
  controllers: [WifiController],
  providers: [WifiService],
  exports: [WifiService],
})
export class WifiModule {}
