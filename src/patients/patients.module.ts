import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { PatientsService } from './patients.service' 
import { PatientsController } from './patients.controller' 

@Module({
  imports: [PrismaServiceModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}