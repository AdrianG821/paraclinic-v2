import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { Normal_ValuesController } from './normal_values.controller' 
import { Normal_ValuesService } from './normal_values.service'  

@Module({
  imports: [PrismaServiceModule],
  controllers: [Normal_ValuesController],
  providers: [Normal_ValuesService],
})
export class Normal_ValuesModule {}