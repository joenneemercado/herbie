import { forwardRef, Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { DatabaseModule } from '@src/database/database.module';
import { QueueModule } from '@src/queue/queue.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => QueueModule), // Use forwardRef para resolver a dependência circular QueueModule, // Certifique-se de que o QueueModule está importado aqui
    // BullModule.registerQueue({
    //   name: 'import-queue',
    // }),
  ],
  providers: [ImportService],
  controllers: [ImportController],
  exports: [ImportService],
})
export class ImportModule {}
