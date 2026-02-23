import { IsNotEmpty, IsEnum, IsString, MaxLength, MinLength, IsInt, IsOptional, IsDate , IsEmail } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdatePatient {

    @IsInt()
    @IsNotEmpty()
    id: number

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MinLength(3)
    @MaxLength(30)
    @IsOptional()
    first_name?: string

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @MinLength(3)
    @MaxLength(30)
    @IsOptional()
    last_name?: string


    @Transform(({ value }) => new Date(value))
    @IsDate()
    @IsOptional()
    date_of_birth?: Date

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

}