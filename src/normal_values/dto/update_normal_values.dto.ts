import { IsNotEmpty, IsEnum, IsString, MaxLength, MinLength, IsInt, IsBoolean , IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'
import { TypeResults } from '@prisma/client'
import { UmAge } from '@prisma/client'
import { Sex } from '@prisma/client'


export class UpdateNormal_ValuesDto {

    @IsInt()
    id: number

    @IsInt()
    @IsNotEmpty()
    ref_id: number

    @IsEnum(Sex)
    sex: Sex

    @IsEnum(UmAge)
    um: UmAge

    @IsInt()
    @IsNotEmpty()
    age_from: number

    @IsInt()
    @IsNotEmpty()
    age_to: number

    @IsString()
    @IsOptional()
    min?: string

    @IsString()
    @IsOptional()
    max?: string


}