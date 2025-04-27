import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaingDto } from './create-campaign.dto';

export class UpdateCampaignDto extends PartialType(CreateCampaingDto) {}
