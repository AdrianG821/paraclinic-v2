import { IsInt, Min, IsEnum, IsString, Length, IsOptional, IsUUID , ValidateIf, MaxLength ,IsNotEmpty, IsBoolean, IsArray} from 'class-validator'
import { Transform } from 'class-transformer'
import { Type as TransformType } from 'class-transformer'


export class Insert_InvestigationsDto {

    @IsInt()
    @IsNotEmpty()
    request_id: number

    @IsNotEmpty()
    @IsArray()
    investigation_id: number[]

}