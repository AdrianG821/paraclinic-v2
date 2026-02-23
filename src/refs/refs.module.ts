import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { RefsService } from './refs.service' 
import { RefsController } from './refs.controller' 

@Module({
  imports: [PrismaServiceModule],
  controllers: [RefsController],
  providers: [RefsService],
})
export class RefsModule {}