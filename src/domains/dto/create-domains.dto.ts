import { IsNotEmpty, IsEnum, IsString, MaxLength, MinLength, IsInt } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateDomainDto {

    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    name: string

    @IsInt()
    id_laboratory: number
}