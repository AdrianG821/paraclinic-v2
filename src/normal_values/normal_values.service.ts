import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'
import { Sex } from '@prisma/client'
import { UmAge } from '@prisma/client'

type CreateNormal_Values = {
    id?: number,
    ref_id: number,
    sex: Sex,
    um: UmAge,
    age_from: number,
    age_to: number,
    min?: string,
    max?: string,
}


@Injectable()
export class Normal_ValuesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(params: CreateNormal_Values[]) {
        return this.prisma.prisma.normal_values.createMany({
            data: params.map(({ref_id , sex , um , age_from , age_to , min, max}) => ({
                ref_id , sex , um , age_from , age_to , min, max
            }))
        })
        }
    
    async getNormal_Values(ref_id: number) {
        const items = await this.prisma.prisma.normal_values.findMany({
            where: {ref_id},
            select: {id: true,  ref_id: true , sex: true , um: true , age_from: true , age_to: true , min: true, max: true }
        })

        return items
    }

    async updateNormal_Values(params: CreateNormal_Values[]) {
        const items = params.map(async (p) => {
            const { id, ref_id, um, sex , age_from, age_to, min , max } = p
            const updated = await this.prisma.prisma.normal_values.update({
                where: { id: id },
                data: { ref_id, sex , um , age_from, age_to , min , max  },
                
            })
            return updated
            }
        )
        return items
    }

    async deletedNormal_Values(ids: number[]){
        console.log(ids)
        // const items = id.map(async (w) => {
        //     const id = w
        //     const deleted = await this.prisma.prisma.normal_values.delete({
        //         where: {id}
        //     })
        //     return deleted
        // })

        const items = await this.prisma.prisma.normal_values.deleteMany({
            where: { id: { in: ids } }
        })

        return items
        
    }

}

