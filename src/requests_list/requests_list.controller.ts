import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, ConflictException ,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards,
  Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { RequestsService } from './requests_list.service' 

@Controller('requests')
@UseGuards(AuthGuard('jwt'))
export class RequestsController {
    constructor (private readonly requests: RequestsService) {}

    @Post('all')
    async getRequests(@Req() req: any, @Body() payload: { fromDate: string , endDate: string } ){

        const items = await this.requests.getAllRequests(payload)

        return items
    }
    
    @Get('find/request')
    async findRequestByReq(@Req() req: any, @Query('reqCode') reqCode: string) {
        const items = await this.requests.findOneRequest(reqCode)

        return items
    }

}