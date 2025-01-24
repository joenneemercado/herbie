import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { AudiencesModule } from './audiences/audiences.module';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService],
  imports:[
    AudiencesModule
  ]
})
export class CampaignsModule {}
