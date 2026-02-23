import { IsInt, Min, IsEnum, IsString, Length, IsOptional, IsUUID , ValidateIf, MaxLength ,IsNotEmpty, IsBoolean, IsArray, MinLength} from 'class-validator'
import { Transform } from 'class-transformer'
import { Type as TransformType } from 'class-transformer'


export class DtoSaveResults {

    @IsInt()
    @IsNotEmpty()
    request_id: number

    @IsInt()
    @IsNotEmpty()
    machine_id: number

    @IsInt()
    @IsNotEmpty()
    investigation_id: number


    @IsInt()
    @IsNotEmpty()
    ref_id: number

    @IsString()
    @IsNotEmpty()
    result: string


}