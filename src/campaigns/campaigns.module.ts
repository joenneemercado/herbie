import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { AudiencesModule } from './audiences/audiences.module';
import { DatabaseModule } from '@src/database/database.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService, JwtService],
  imports: [AudiencesModule, DatabaseModule],
  exports: [CampaignsService],
})
export class CampaignsModule {}
