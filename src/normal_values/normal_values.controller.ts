import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, ConflictException ,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards,
  Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { Normal_ValuesService } from './normal_values.service'
import { CreateNormal_ValuesDto } from './dto/create_normal_values.dto'
import { UpdateNormal_ValuesDto } from './dto/update_normal_values.dto'



@Controller('normal_values')
@UseGuards(AuthGuard('jwt'))
export class Normal_ValuesController {
    constructor (private readonly normal_values: Normal_ValuesService) {}

    @Post()
    async create(@Req() req:any , @Body() dto: CreateNormal_ValuesDto[]) {
      const items = dto.map(d => ({
        ref_id: d.ref_id,
        sex: d.sex,
        um: d.um,
        age_from: d.age_from,
        age_to: d.age_to,
        min: d.min,
        max: d.max,
      }))
      const sent = await this.normal_values.create(items)

      return sent
      
    }

    @Get(':id')
    async getNormal_Values(@Req() req: any , @Param('id', ParseIntPipe) ref_id: number){
      const items = await this.normal_values.getNormal_Values(ref_id)

      return {data: items}
    }

    @Patch()
    async patchNormal_Values(@Req() req: any, @Body() dto: UpdateNormal_ValuesDto[]){
     
      const items = dto.map(d => ({
        id: d.id,
        ref_id: d.ref_id,
        sex: d.sex,
        um: d.um,
        age_from: d.age_from,
        age_to: d.age_to,
        min: d.min,
        max: d.max,
      }))
      const sent = await this.normal_values.updateNormal_Values(items)

      return sent

    }

    @Delete()
    async deleteNormal_Values(@Req() req: any,@Body() body: { items: {id: number}[] } ) {
      const normal_Values = body.items.map(w => w.id)
      // console.log(normal_Values)
      const deleted = await this.normal_values.deletedNormal_Values(normal_Values)
      return deleted
    }


}