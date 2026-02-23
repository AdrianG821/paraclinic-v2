import { IsNotEmpty, IsEnum, IsString, MaxLength, MinLength, IsInt, IsBoolean , IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateInvestigations {

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    name: string

    @IsInt()
    @IsNotEmpty()
    machinesId: number

    @IsString()
    @IsNotEmpty()
    code: string

    @IsString()
    @IsOptional()
    cas_name?: string
    
    @IsString()
    @IsOptional()
    cas_code?: string
    
    @IsBoolean()
    active: boolean

    @IsBoolean()
    printable: boolean

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsOptional()
    work_method?: string

    @IsBoolean()
    is_renar: boolean

    @IsBoolean()
    export_cas: boolean
}