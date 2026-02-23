import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { MachinesController } from './machines.controller' 
import { MachinesService } from './machines.service' 

@Module({
  imports: [PrismaServiceModule],
  controllers: [MachinesController],
  providers: [MachinesService],
})
export class MachinesModule {}