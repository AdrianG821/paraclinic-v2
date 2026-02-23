import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, ConflictException ,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards,
  Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { DomainsService } from './domains.service' 
import { CreateDomainDto } from './dto/create-domains.dto' 
import { UpdateDomainDto } from './dto/update-domains.dto'

@Controller('domains')
@UseGuards(AuthGuard('jwt'))
export class DomainsController {
    constructor (private readonly domains: DomainsService) {}

    @Post()
    async create(@Req() req:any , @Body() dto: CreateDomainDto) {
      const userId = req.user.userId as number

      const items = await this.domains.create({
        name: dto.name,
        id_laboratory: dto.id_laboratory
      })

      return { data: items }
    }

    @Get(':id')
    async getId(@Param('id', ParseIntPipe) id: number) {
      const domain =  await this.domains.findOne(id)
      return domain
    }

    @Get()
    async getDomains(@Req() req:any) {
      const userId = req.user.userId as number

      const items = await this.domains.getDomains()

      return {data: items}
    }

    @Patch(':id')
    async updateDomain(@Param('id', ParseIntPipe) id: number , @Body() dto: UpdateDomainDto) {
      return await this.domains.updateDomain(id ,  dto)
    }
}