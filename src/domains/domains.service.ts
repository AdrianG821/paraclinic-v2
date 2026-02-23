import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'

type CreateDomains = {
    name: string
    id_laboratory: number
}

@Injectable()
export class DomainsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(params: CreateDomains) {
        const { name , id_laboratory } = params

        const alreadyExists = await this.prisma.prisma.domain.findFirst({
            where: { name: name },
            select: { name: true, id_laboratory: true }
        })

        if (alreadyExists) throw new ConflictException('Deja ai un domeniu cu acelasi nume!')

        return this.prisma.prisma.domain.create({
            data: { name: name , id_laboratory },
            select: { id: true,  name: true, id_laboratory: true , createdAt: true}
        })
    }

    async findOne(id: number) {
        const domain = await this.prisma.prisma.domain.findUnique({
            where: {id},
            select: {
                name: true,
            }
        })

        if (!domain) throw new NotFoundException(`Domeniul cu id-ul ${id} nu a fost gasit`)

        return domain
    }

    async updateDomain(id, params: CreateDomains) {
        const { name , id_laboratory } = params

        return this.prisma.prisma.domain.update({
            where: {id},
            data: {name: name , id_laboratory } 
        })
    }

    async getDomains() {
        return this.prisma.prisma.domain.findMany({
            select: {id: true, name: true, id_laboratory: true}
        })
    }
}