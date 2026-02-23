import { IsNotEmpty, IsEnum, IsString, MaxLength, MinLength, IsInt, IsBoolean , IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'
import { TypeResults } from '@prisma/client'

export class UpdateRefsDto {

    @IsInt()
    @IsNotEmpty()
    investigation_id: number

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    name: string

    @IsString()
    @IsNotEmpty()
    code: string

    @IsEnum(TypeResults)
    type: TypeResults
    
    @IsBoolean()
    active: boolean

    @IsBoolean()
    printable: boolean

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MaxLength(30)
    @IsString()
    umRef?: string

}