import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'



@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) {}

    
}