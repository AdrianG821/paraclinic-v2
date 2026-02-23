import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'

function toUpperCase(code: string){
    const s = code.trim()

    const m = s.match(/^([A-Za-z]{2})(\d{4})$/)

    if(!m) throw new BadRequestException("Codul a fost scris gresit!")

    const prefix = m[1].toUpperCase()
    const number = Number(m[2])

    return `${prefix}${number}`

}


@Injectable()
export class RequestsService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllRequests(payload: { fromDate: string , endDate: string }) {
        const from = new Date(`${payload.fromDate}`)
        const end = new Date(`${payload.endDate}`)
        const endEnd = new Date(end)
        endEnd.setUTCDate(endEnd.getUTCDate() + 1)



        const items = await this.prisma.prisma.lab_requests.findMany({
            where: { createdAt: { gte: from, lt:endEnd } },
            select: { id: true, rcode: true , pacient: { select: { first_name: true, last_name: true } } , createdAt: true}
        })
        
        if(items.length === 0) throw new BadRequestException("Nu a fost gasita nicio investigatie")

        const requests = Array.from(new Set(items.map(w => w.id)))

        const temp = await this.prisma.prisma.results.findMany({
                        where: {request_id: {in: requests}},
                        select: { request_id:true , validated: true }
                    })
        // console.log(temp)
        const resultsByRequest = new Map<number, { request_id: number; validated: boolean }[]>();

        for(const r of temp) {
            const arr = resultsByRequest.get(r.request_id) ?? []
            arr.push(r)
            resultsByRequest.set(r.request_id, arr)
        }

        const status = items.map(w => {
            const res = resultsByRequest.get(w.id) ?? []

            const term = res.length > 0 && res.every(x => x.validated === true)
            return {
                ...w,
                status: term ? "Terminata" : "In lucru"
            }
        })

        return status
        
    }

    async findOneRequest(reqCode: string) {
        const code = toUpperCase(reqCode)
        console.log(code)
        const items = await this.prisma.prisma.lab_requests.findFirst({
            where: { rcode: code },
            select: {id: true}
        })

        if(!items) throw new NotFoundException("Nu a fost gasita cererea")
        
        return items
    }
    
}