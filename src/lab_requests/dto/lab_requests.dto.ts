import { IsInt, Min, IsEnum, IsString, Length, IsOptional, IsUUID , ValidateIf, MaxLength ,IsNotEmpty} from 'class-validator'
import { Transform } from 'class-transformer'
import { Type as TransformType } from 'class-transformer'


export class Lab_RequestsDto {

    @IsInt()
    @IsNotEmpty()
    patient_id: number

    // @IsInt()
    // @IsNotEmpty()
    // requested_id: number

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(30)
    @IsNotEmpty()
    medic: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(30)
    @IsNotEmpty()
    diagnostic: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(50)
    @IsOptional()
    description?: string

    @IsInt()
    @IsOptional()
    payment_type?: number

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(50)
    @IsOptional()
    cas_code?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(50)
    @IsOptional()
    cas_number?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(50)
    @IsOptional()
    cas_date?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(50)
    @IsOptional()
    cas_diagnostic?: string

}