import { IsEmail , IsString , MinLength , IsEnum} from "class-validator";
import { Role } from "@prisma/client";

export class RegisterDto {
    @IsString()
    @MinLength(3)
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsEnum(Role)
    role: Role
}