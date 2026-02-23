import {
  Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, ConflictException ,
  Param, ParseIntPipe, Body, Post, Query, Req, UseGuards,
  Patch
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { PaymentsService } from './payments.service' 
import { CreatePaymentsDto } from './dto/create-payment.dto' 

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor (private readonly payments: PaymentsService) {}


}