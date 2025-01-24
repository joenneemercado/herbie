import { Module } from '@nestjs/common';
import { AudiencesService } from './audiences.service';
import { AudiencesController } from './audiences.controller';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  controllers: [AudiencesController],
  providers: [AudiencesService],
  exports: [AudiencesService],
  imports:[DatabaseModule]
})
export class AudiencesModule {}
