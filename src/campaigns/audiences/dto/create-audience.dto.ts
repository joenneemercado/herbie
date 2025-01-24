export class CreateAudienceDto {
    id?: number;
    name: string;
    statusId?: number;
    createdBy?: number;
    organization_id: string;
    date_birth_start?: string[] | string;
    date_birth_end?: string[] | string;
    gender?: String
    marital_status?: String
    date_start?: Date;
    date_end?: Date;
    page: number;
    limit: number;
}
