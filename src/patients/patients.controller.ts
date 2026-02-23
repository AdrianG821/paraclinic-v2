import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, ConflictException ,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards,
  Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { PatientsService } from './patients.service'  
import { CreatePatientDto } from './dto/create-patients.dto'
import { UpdatePatient } from './dto/update-patient.dto'


@Controller('patients')
@UseGuards(AuthGuard('jwt'))
export class PatientsController {
    constructor (private readonly patients: PatientsService) {}

    @Get('/request')
    async getPatient(@Req() req:any , @Query('cnp') cnp: string) {
        const found = await this.patients.getPatient(cnp)
        // console.log(found)
        // if (found === null ){
        //     console.log('avem o valoare null')
        // }
        return {data: found}
    }

    @Get('/analyse/request')
    async getPatientReq(@Req() req:any , @Query('patient_Id') patient_Id: string) {
        const found = await this.patients.getPatReq(patient_Id)

        return {data: found}
    }

    @Get('/:id')
    async getSinglePatient(@Req() req:any , @Param('id', ParseIntPipe) id: number) {
        const found = await this.patients.getSinglePatient(id)

        return {data: found}
    }

    @Get('/get/all')
    async getMultiplePatient(@Req() req:any ) {
        const found = await this.patients.getMultiplePatients()

        return {data: found}
    }
    
    @Post()
    async createPatient(@Req() req: any , @Body() dto: CreatePatientDto) {
        // console.log(dto)
        
        const items = await this.patients.createPatient({
            first_name: dto.first_name,
            last_name: dto.last_name,
            cnp: dto.cnp,
            date_of_birth: dto.date_of_birth,
            place_of_birth: dto.place_of_birth,
            phone_number: dto.phone_number,
            email: dto.email,
            domicile: dto.domicile,
            sex: dto.sex,
        })

        // console.log(items)
    }

    @Patch()
    async updatePatient(@Body() dto: UpdatePatient) {
        const items = await this.patients.updatePatients({
            id: dto.id,
            first_name: dto.first_name,
            last_name: dto.last_name,
            date_of_birth: dto.date_of_birth,
            place_of_birth: dto.place_of_birth,
            phone_number: dto.phone_number,
            email: dto.email,
            domicile: dto.domicile,
        })
    }

}