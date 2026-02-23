import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { Lab_RequestsService } from './lab_requests.service'
import { Lab_RequestsController } from './lab_requests.controller'

@Module({
  imports: [PrismaServiceModule],
  controllers: [Lab_RequestsController],
  providers: [Lab_RequestsService],
})
export class Lab_RequestsModule {}
