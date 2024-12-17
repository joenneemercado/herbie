import { forwardRef, Module } from '@nestjs/common';
import { OpahService } from './opah.service';
import { OpahController } from './opah.controller';
import { DatabaseModule } from '@src/database/database.module';
import { QueueModule } from '@src/queue/queue.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => QueueModule)],
  controllers: [OpahController],
  providers: [OpahService],
  exports: [OpahService],
})
export class OpahModule {}
