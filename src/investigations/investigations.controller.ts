import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, ConflictException ,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards,
  Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { InvestigationsService } from './investigations.service' 
import { CreateInvestigations } from './dto/create-investigations.dto' 
import { UpdateInvestigationsDto } from './dto/update-investigations.dto'

@Controller('investigations')
@UseGuards(AuthGuard('jwt'))
export class InvestigationsController {
    constructor(private readonly investigations: InvestigationsService) {}

    @Post()
    async create(@Req() req:any , @Body() dto: CreateInvestigations) {
        const userId = req.user.userId as number

        const items = await this.investigations.create({
            name: dto.name,
            machinesId: dto.machinesId,
            code: dto.code,
            cas_name: dto.cas_name,
            cas_code: dto.cas_code,
            active: dto.active,
            printable: dto.printable,
            work_method: dto.work_method,
            is_renar: dto.is_renar,
            export_cas: dto.export_cas,
        })
        

        return {data: items}
    }

    @Get('/machines')
    async getMachines(@Req() req:any){
        const machines = await this.investigations.getMachines()

        // console.log(machines)
        return {data: machines}
    }

    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        const items = await this.investigations.getOne(id)

        // console.log(items)

        return { data: items}
    }

    @Get()
    async getMany(@Req() req: any) {
        const userId = req.user.userId as number

        const items = await this.investigations.getMany()

        return { data: items}
    }

    @Patch(':id')
    async patchInv(@Param('id', ParseIntPipe) id: number , @Body() dto: UpdateInvestigationsDto , @Req() req: any) {
        const items = await this.investigations.patchInv(id, dto)

        // console.log(items)

        return { data: items}
    }
}