import { IsString, MinLength , IsInt} from 'class-validator';

export class UpdateDomainDto {
  @IsString()
  @MinLength(1, { message: 'Numele nu poate fi gol' })
  name: string

  @IsInt()
  id_laboratory: number
}
