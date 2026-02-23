import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { DomainsService } from './domains.service' 
import { DomainsController } from './domains.controller'  

@Module({
  imports: [PrismaServiceModule],
  controllers: [DomainsController],
  providers: [DomainsService],
})
export class DomainsModule {}