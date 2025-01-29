import { ApiProperty } from "@nestjs/swagger";

export class CreateTagDto {
    @ApiProperty()
    organization_id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    createdBy: number;

}

export class CreateTagWithAssociationDto {
    @ApiProperty()
    organization_id: string;

    @ApiProperty()
    idCustomer: number;

    @ApiProperty()
    idCampaing: number;

    @ApiProperty()
    createdBy: number;
    

}
