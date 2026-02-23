import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'

type CreateInvestigations = {
    name: string
    machinesId: number,
    code: string,
    cas_name?: string,
    cas_code?: string,
    active: boolean,
    printable: boolean,
    work_method?: string,
    is_renar: boolean,
    export_cas: boolean,
}

@Injectable()
export class InvestigationsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(params: CreateInvestigations) {
        console.log(params)
        const { name , machinesId , code , cas_name , cas_code , active , printable ,  work_method , is_renar , export_cas } = params
        return await this.prisma.prisma.investigations.create({
            data: { name , machinesId , code , cas_name , cas_code , active , printable ,  work_method , is_renar , export_cas },
            select: { id: true , name: true ,machinesId: true , code: true , cas_name: true , cas_code: true , active: true , printable: true ,  work_method: true , is_renar: true , export_cas: true },
        })
    }

    async getMachines() {
        
        return await this.prisma.prisma.machines.findMany({
            select: {id: true , name: true}
        })
    }

    async getOne(id: number) {

        const items = await this.prisma.prisma.investigations.findUnique({
            where: {id},
            select: {id: true , name: true , machinesId: true , code: true , cas_name: true , cas_code: true , active: true , printable: true ,  work_method: true , is_renar: true , export_cas: true }
        })

        if (!items) throw new NotFoundException(`Investigatia cu id-ul ${id} nu a fost gasit`)

        return items
    }

    async getMany() {
        const items = await this.prisma.prisma.investigations.findMany({
            select: { id: true, name: true, code: true , machinesId: true , machines: { select: { name: true } } , active: true }
        })

        return items
    }

    async patchInv(id: number , params: CreateInvestigations) {
        const { name , machinesId , code , cas_name , cas_code , active , printable ,  work_method , is_renar , export_cas } = params
        const exists = await this.prisma.prisma.investigations.findFirst({where: {id} , select: {id: true}})
        if(!exists)  throw new NotFoundException("Investigatia nu a fost gasita!")
        
        const updateInv = await this.prisma.prisma.investigations.update({
            where: {id},
            data: {name , machinesId , code , cas_name , cas_code , active , printable ,  work_method , is_renar , export_cas}
        })

        return updateInv
    }   
}
