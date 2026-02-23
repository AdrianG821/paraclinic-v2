import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { InvestigationsController } from './investigations.controller'  
import { InvestigationsService } from './investigations.service' 

@Module({
  imports: [PrismaServiceModule],
  controllers: [InvestigationsController],
  providers: [InvestigationsService],
})
export class InvestigationsModule {}