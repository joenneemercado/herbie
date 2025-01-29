import { ApiProperty } from "@nestjs/swagger";

export class createCampaingDto {
    @ApiProperty()
    id?: number;

    @ApiProperty()
    idAudience?: number[];

    @ApiProperty()
    name?: string;

    @ApiProperty()
    message?: string;

    @ApiProperty()
    typeMessage?: number;

    @ApiProperty()
    sendingBy?: string;

    @ApiProperty()
    statusId?: number;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;

    @ApiProperty()
    createdBy?: number;

    @ApiProperty()
    updatedBy?: number;

    @ApiProperty()
    priority?: number;

    @ApiProperty()
    channelId?: number;

    @ApiProperty()
    tags?: number[];

    @ApiProperty()
    dateStart?: string;

    @ApiProperty()
    dateEnd?: string;

    @ApiProperty()
    jsonMeta?: string;

    @ApiProperty()
    subject?: string;
    
    @ApiProperty()
    organization_id: string;
}

