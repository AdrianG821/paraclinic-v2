import { IsNotEmpty, IsEnum, IsString, MaxLength, MinLength, IsInt, IsBoolean, IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateMachinesDto {

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    name: string

    @IsInt()
    domain_id: number

    @IsInt()
    lab_id: number

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(30)
    @IsOptional()
    method?: string

    @IsBoolean()
    active: boolean
}