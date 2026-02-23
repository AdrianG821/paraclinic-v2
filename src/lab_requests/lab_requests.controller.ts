import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards, Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { Lab_RequestsService } from './lab_requests.service'
import { Lab_RequestsDto } from './dto/lab_requests.dto'
import { Insert_InvestigationsDto } from './dto/insert_investigations.dto'
import { DtoSaveResults } from './dto/save-results.dto'
 
@Controller('lab_requests')
@UseGuards(AuthGuard('jwt'))
export class Lab_RequestsController {
    constructor(private readonly requests: Lab_RequestsService) {}

    @Post('insert/investigations')
    async insertInvestigations(@Req() req: any, @Body() dto: Insert_InvestigationsDto) {
        const userId = req.user.userId as number

        const items = await this.requests.insertInv({
            request_id: dto.request_id,
            investigation_id: dto.investigation_id,
        })

        // return items
    }

    @Post('getRefs')
    async getInvRefs(@Req() req: any, @Body() body: {ids: number[]}) {
        const userId = req.user.userId as number

        const items = await this.requests.findRefs(body.ids)

        return items
    }
    @Post('save/new/machine/:invId/:id/:currentInv')
    async saveNewMachine(@Req() req: any, @Param('invId', ParseIntPipe) invId: number, @Param('id', ParseIntPipe) id: number, @Param('currentInv', ParseIntPipe) currentInv: number) {
        const items = await this.requests.saveNewMachine(invId, id, currentInv)

        return items
    }

    @Post('send/:id')
    async sendToLab(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        const userId = req.user.userId as number

        const items = await this.requests.sendToLab(id)

        return items
    }

    @Post()
    async create(@Req() req: any, @Body() dto: Lab_RequestsDto) {
        const userId = req.user.userId as number
        // console.log(dto)
        const create = await this.requests.create({
            patient_id: dto.patient_id,
            requested_id: userId,
            medic: dto.medic,
            diagnostic: dto.diagnostic,
            description: dto.description,
            payment_type: dto.payment_type,
            cas_code: dto.cas_code,
            cas_number: dto.cas_number,
            cas_date: dto.cas_date,
            cas_diagnostic: dto.cas_diagnostic
        })

        return {data: create}


    }

    @Get('get/investigations')
    async getInvestigations(@Req() req: any) {
        const userId = req.user.userId as number
   
        const  items  = await this.requests.getInv()
        
        
        return items

    }

    @Get('get/insert/investigations/:id')
    async getInsertInv(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        const items = await this.requests.getInsertInv(id)
        // console.log(items)
        return items
    } 

    @Get('get/insert/investigations/validated/:id')
    async getInsertValidatedInv(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        const items = await this.requests.getInsertValidatedInv(id)
        // console.log(items)
        return items
    } 

    @Get('get/all/printable')
    async getPrintable(@Req() req: any) {
        const items = await this.requests.getPrintable()
        return {data: items}
    } 

    @Get(':id')
    async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        const userId = req.user.userId as number

        const  items  = await this.requests.findRequest(id)
        // console.log(id)
        
        return {data: items}

    }


    @Post('get/machines/inv')
    async getInvestigationsMachines (@Req() req: any, @Body() payload: { investigation_id: number, name: string }){
        const userId = req.user.userId as number

        const  items  = await this.requests.getInvestigationsMachines(payload)

        return items
    }



    @Post('delete/inserted/investigations/:id')
    async deleteInsertedInv(@Req() req: any,@Param('id') id: number , @Body() insertedInv: number[]) {
        
        const items = await this.requests.deleteInsertedInv(insertedInv,id)

        return items
    }

    @Patch('save/results')
    async saveResults(@Req() req: any, @Body() dto: DtoSaveResults) {
        const userId = req.user.userId as number

        const items = await this.requests.patchResults({
            request_id: dto.request_id,
            investigation_id: dto.investigation_id,
            machine_id: dto.machine_id,
            ref_id: dto.ref_id,
            result: dto.result
        })

        
        
        return items
    }

    @Patch('validate/investigations')
    async validateInv(@Req() req: any, @Body() data: {request_id: number, ids: number[]}) {
        const userId = req.user.userId as number

        const items = await this.requests.validateInv(userId, data)
        
        return items
    }

    @Patch('delete/results')
    async deleteResults(@Req() req: any, @Body() data: {request_id: number, ids: number[]}) {
        const userId = req.user.userId as number

        const items = await this.requests.deleteResults(userId , data)
        
        return items
    }


    //trb dto pt patchul de la results
    // @Patch('patch/results/:id')
    // async patchResults(@Req() req:any , @Param('id', ParseIntPipe) id: number ,@Body() body: any) {
    //     console.log(body)
    //     console.log(id)

    //     const items = await this.requests.patchResults(id, body)

    //     return items
    // }


}