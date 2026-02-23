import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { RequestsService } from './requests_list.service' 
import { RequestsController } from './requests_list.controller' 

@Module({
  imports: [PrismaServiceModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}