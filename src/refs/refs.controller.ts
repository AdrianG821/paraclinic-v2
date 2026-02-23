import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, ConflictException ,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards,
  Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { CreateRefsDto } from './dto/create-refs.dto'  
import { RefsService } from './refs.service'
import { UpdateRefsDto } from './dto/update-refs.dto'

@Controller('refs')
@UseGuards(AuthGuard('jwt'))
export class RefsController {
    constructor (private readonly refs: RefsService) {}

    @Post()
    async createRefs(@Req() req:any , @Body() dto: CreateRefsDto) {
        const items = await this.refs.createRef({
            investigation_id: dto.investigation_id,
            name: dto.name,
            code: dto.code,
            type: dto.type,
            active: dto.active,
            printable: dto.printable,
        })
        // console.log(items)
        // return {data: items}
    }

    @Get(':id')
    async getRefsById(@Req() req: any , @Param('id', ParseIntPipe) id: number) {
        const items = await this.refs.getRefsById(id)

        // console.log(items)
        return { data: items }
    }

    @Get(':id/ref')
    async getRef(@Req() req: any , @Param('id', ParseIntPipe) id: number) {
        const items = await this.refs.getRef(id)

        return { data: items }
    }

    @Patch(':id')
    async patchRef(@Param('id', ParseIntPipe) id: number , @Body() dto: UpdateRefsDto , @Req() req: any) {
        const items = await this.refs.patchRef(id, dto)

        return items
    }

}