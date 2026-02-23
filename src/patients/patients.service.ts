import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'

type Patient = {
    first_name: string,
    last_name: string,
    cnp: string,
    date_of_birth: Date,
    place_of_birth?: string,
    phone_number?: string,
    email?: string,
    domicile?: string,
    sex: 'MALE' | 'FEMALE'
}

type UpdatePatient = {
    id: number,
    first_name?: string,
    last_name?: string,
    date_of_birth?: Date,
    place_of_birth?: string,
    phone_number?: string,
    email?: string,
    domicile?: string,
}

@Injectable()
export class PatientsService {
    constructor(private readonly prisma: PrismaService) {}

    async getPatient(cnp: string) {
        const patient = await this.prisma.prisma.pacients.findFirst({
            where: {cnp},
            select: {id: true, first_name:true , last_name: true , cnp: true , sex: true , date_of_birth: true , place_of_birth: true,  phone_number: true , email: true , domicile: true, }
        })

        return patient
    }
    

    async getPatReq(patient_Id: string) {
        const id = Number(patient_Id)
        const patient = await this.prisma.prisma.pacients.findFirst({
            where: {id: id},
            select: {id: true, first_name:true , last_name: true , cnp: true , sex: true , date_of_birth: true , place_of_birth: true,  phone_number: true , email: true , domicile: true, }
        })

        return patient
    }

    async getSinglePatient(id: number) {
        const patient = await this.prisma.prisma.pacients.findFirst({
            where: {id},
            select: {id: true, first_name:true , last_name: true , sex: true , cnp: true , date_of_birth: true , place_of_birth: true,  phone_number: true , email: true , domicile: true, }
        })

        if(!patient) throw new NotFoundException(`Nu a fost gasit pacientul cu id-ul: ${id}`)

        return patient
    }

    async getMultiplePatients() {
        const found = await this.prisma.prisma.pacients.findFirst({
            select:{ id: true }
        })

        if(!found) throw new NotFoundException("Nu aveti pacienti in baza de date")

        const items = await this.prisma.prisma.pacients.findMany({
            select: { id:true , last_name: true, first_name: true, email:true, phone_number: true }
        })

        return items
    }
    
    async createPatient(params: Patient) {
        const { first_name , last_name ,cnp , date_of_birth , place_of_birth , email , domicile , sex} = params
        // if(this.getPatient(cnp) !== null) {
        //     return console.log("Pacient in baza de date")
        // }

        const items = await this.prisma.prisma.pacients.create({
            data: { first_name , last_name ,cnp , date_of_birth , place_of_birth , email , domicile , sex }
        })


        return items
    }

    async updatePatients(params: UpdatePatient) {
        const {id, first_name , last_name  , date_of_birth , place_of_birth , email , domicile} = params

        const update = await this.prisma.prisma.pacients.update({
            where: { id },
            data: { first_name , last_name  , date_of_birth , place_of_birth , email , domicile }
        })

        if(!update) throw new BadRequestException("Nu a fost updatat pacientul")
    }
}