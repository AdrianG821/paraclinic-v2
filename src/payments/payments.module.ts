import { Module } from '@nestjs/common'
import { PrismaServiceModule } from 'prisma/prisma.module'
import { PaymentsService } from './payments.service'  
import { PaymentsController } from './payments.controller' 

@Module({
  imports: [PrismaServiceModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}