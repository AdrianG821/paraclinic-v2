import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'
import { TypeResults } from '@prisma/client'

type CreateRefs = {
    investigation_id: number
    name: string
    code: string
    type: TypeResults
    active: boolean
    printable: boolean
    umRef?: string
}

@Injectable()
export class RefsService {
    constructor(private readonly prisma: PrismaService) {}

    async createRef(params: CreateRefs) {
        const { investigation_id , name , code , type , active , printable } = params

        const items = await this.prisma.prisma.refs.create({
            data: { investigation_id , name , code , type , active , printable },
            select: {id: true , investigation_id: true , name: true , code: true, type: true , active: true , printable: true }
        })
        return items
    }

    async getRefsById(id: number) {
        const items = await this.prisma.prisma.refs.findMany({
            where: { investigation_id: id },
            select: { id: true , investigation_id: true , name: true , code: true, type: true , active: true , printable: true}
        })
        

        return items
    }

    async getRef(id: number) {
        const items = await this.prisma.prisma.refs.findUnique({
            where: { id },
            select: { id: true , investigation_id: true , name: true , code: true, type: true , active: true , printable: true  , um: true }
        })
        return items
    }

    async patchRef(id: number , params: CreateRefs) {
        const { name , code , type , active , printable , umRef} = params
        const exists = await this.prisma.prisma.refs.findFirst({
            where: { id },
            select: { id: true }
        })

        if(!exists) throw new NotFoundException("Referinta nu a fost gasita!")

        const items = await this.prisma.prisma.refs.update({
            where: {id},
            data: { name , code , type , active , printable , um: umRef }
        })
        return items
    }

    
}