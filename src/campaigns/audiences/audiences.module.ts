import { Module } from '@nestjs/common';
import { AudiencesService } from './audiences.service';
import { AudiencesController } from './audiences.controller';
import { DatabaseModule } from '@src/database/database.module';
import { JwtService } from '@nestjs/jwt';
import { InteractionsController } from '@src/interactions/interactions.controller';
import { InteractionsModule } from '@src/interactions/interactions.module';

@Module({
  controllers: [AudiencesController, InteractionsController],
  providers: [AudiencesService, JwtService],
  exports: [AudiencesService],
  imports: [DatabaseModule, InteractionsModule],
})
export class AudiencesModule {}
