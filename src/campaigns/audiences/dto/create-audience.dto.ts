import { ApiProperty } from "@nestjs/swagger";

export class CreateAudienceDto {
    @ApiProperty()
    id?: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    statusId?: number;

    @ApiProperty()
    createdBy?: number;

    @ApiProperty()
    organization_id: string;

    @ApiProperty()
    date_birth_start?: string[] 

    @ApiProperty()
    date_birth_end?: string[]
    
    @ApiProperty()
    gender?: String

    @ApiProperty()
    marital_status?: String

    @ApiProperty()
    date_start?: Date;

    @ApiProperty()
    date_end?: Date;

    @ApiProperty()
    page?: number;

    @ApiProperty()
    limit?: number;

}

// export class PaginatedAudiencesDto {
//     @ApiProperty({
//         description: 'List all Audiences',
//         isArray: true,
//         type: [CreateAudienceDto],
//         example: {
//             id: 1,
//             name: "audience eMercado",
//             createdAt: "2025-01-24T18:54:20.199Z",
//             createdBy: 1,
//             obs: null,
//             statusId: 1,
//             updatedAt: null,
//             updatedBy: null,
//             organization_id: "cm0l1u61r00003b6junq2pmbi",
//         },
//     })
//     data: PaginatedAudiencesDto[];

//     @ApiProperty({ description: 'Total number of customers' })
//     total: number;

//     @ApiProperty({ description: 'Current page number' })
//     page: number;

//     @ApiProperty({ description: 'Number of items per page' })
//     limit: number;

//     @ApiProperty({ description: 'Total number of pages' })
//     totalPages: number;
// }