import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service";
import { Role } from "@prisma/client"; 

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService){}

    async create(params: { name: string ; email: string; passwordHash: string ; role: Role}) {
        const { name, email, passwordHash , role } = params;
        return this.prisma.prisma.users.create({
            data: { employee_name: name, email, passwordHash , roles: [role] , lab_function: 'EMPLOYED' },
            select: { id: true, employee_name: true, email: true, roles: true, createdAt: true, updatedAt: true },
        })
    }

    findByEmail(email: string){
        return this.prisma.prisma.users.findUnique({
            where: { email },
        })
    }

    findById(id: number) {
        return this.prisma.prisma.users.findUnique({
            where: { id } ,
            select: { id: true, employee_name: true, roles: true , createdAt: true , updatedAt: true }
        })
    }
    

}