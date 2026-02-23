import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, ConflictException ,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards,
  Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { CreateMachinesDto } from './dto/create-machines.dto' 
import { MachinesService } from './machines.service'
import { UpdateMachinDto } from './dto/update-machines.dto'

@Controller('machines')
@UseGuards(AuthGuard('jwt'))
export class MachinesController {
    constructor (private readonly machines: MachinesService) {}

    @Post()
    async create(@Req() req:any , @Body() dto: CreateMachinesDto) {
        const userId = req.user.userId as number
        
        const items  = await this.machines.create({
            name: dto.name,
            domain_id: dto.domain_id,
            lab_id: dto.lab_id,
            method: dto.method,
            active: dto.active,
        })

        return { data: items }
    }
    @Get()
    async getMachines(@Req() req: any) {
        const userId = req.user.userId as number

        const items = await this.machines.getMachines()

        return {data: items}
    }

    @Get('domains')
    async getDomains(@Req() req:any) {
        const userId = req.user.userId as number
        const items = await this.machines.getDomains()

        return { data: items }
    }

    @Get(':id')
    async getId(@Param('id', ParseIntPipe) id: number) {

        const items = await this.machines.getId(id)

        return { data: items }
    }

    @Patch(':id')
    async updateMachine(@Param('id', ParseIntPipe) id: number , @Body() dto: UpdateMachinDto , @Req() req: any, ) {
        const items = await this.machines.updateMachine(id, dto)

        return { data: items }
    }
    
}