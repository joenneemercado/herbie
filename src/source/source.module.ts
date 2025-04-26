import { Module } from '@nestjs/common';
import { SourceService } from './source.service';
import { SourceController } from './source.controller';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  controllers: [SourceController],
  providers: [SourceService],
  imports: [DatabaseModule],
})
export class SourceModule {}
