import { PartialType } from '@nestjs/mapped-types';
import { createCampaingDto } from './create-campaign.dto';

export class UpdateCampaignDto extends PartialType(createCampaingDto) {}
