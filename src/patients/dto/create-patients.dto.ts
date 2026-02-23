import { IsNotEmpty, IsEnum, IsString, MaxLength, MinLength, IsInt, IsOptional, IsDate , IsEmail } from 'class-validator'
import { Transform } from 'class-transformer'
import { Sex } from '@prisma/client'

export class CreatePatientDto {

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    first_name: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    last_name: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    cnp: string

    @Transform(({ value }) => new Date(value))
    @IsNotEmpty()
    @IsDate()
    date_of_birth: Date

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsOptional()
    place_of_birth?: string


    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsOptional()
    domicile?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsOptional()
    email?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsOptional()
    phone_number?: string

    @IsEnum(Sex)
    sex: Sex

}