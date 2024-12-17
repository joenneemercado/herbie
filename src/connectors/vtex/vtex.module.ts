import { forwardRef, Module } from '@nestjs/common';
import { VtexService } from './vtex.service';
import { VtexController } from './vtex.controller';
import { DatabaseModule } from '@src/database/database.module';
import { QueueModule } from '@src/queue/queue.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => QueueModule)],
  controllers: [VtexController],
  providers: [VtexService],
  exports: [VtexService],
})
export class VtexModule {}
