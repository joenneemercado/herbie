import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [DatabaseModule],
})
export class EventsModule {}
