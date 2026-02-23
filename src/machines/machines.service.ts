import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'

type CreateMachine = {
    name: string,
    domain_id: number,
    lab_id: number,
    method?: string,
    active: boolean,
}

@Injectable()
export class MachinesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(params: CreateMachine) {
        const { name, domain_id , lab_id , method , active } = params
        return await this.prisma.prisma.machines.create({
            data: { name, domain_id , lab_id , method , active },
            select: { id: true, domain_id: true, lab_id: true, name: true, method: true , active: true, createdAt: true}
        })
    }

    async getMachines(){
        const machines =  await this.prisma.prisma.machines.findMany({
            select: { id: true, domain_id: true , domains: { select: { name: true } } , lab_id: true, name: true, method: true , active: true, createdAt: true}
        })
        // console.log(machines)
        return machines
    }

    async getDomains() {
        const domains = await this.prisma.prisma.domain.findMany({
            select: { id: true, name: true, id_laboratory: true }
        })
        // console.log(domains)
        return domains
    }

    async getId(id: number) {
        const machine = await this.prisma.prisma.machines.findUnique({
            where: { id },
            select: { id: true, name: true , domain_id: true, method: true, active: true }
        })

        if (!machine) throw new NotFoundException(`Aparatul cu id-ul ${id} nu a fost gasit`)

        return machine
    }

    async updateMachine(id, params: CreateMachine) {
        const { name, domain_id , lab_id , method , active } = params

        const uMachine = await this.prisma.prisma.machines.update({
            where: {id},
            data: { name , domain_id , lab_id , method , active }
        })

        return uMachine
    }

}