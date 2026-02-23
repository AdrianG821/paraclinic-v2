import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaServiceModule } from 'prisma/prisma.module';
import { PrismaClientExceptionFilter } from './common/prisma-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DomainsModule } from './domains/domains.module';
import { MachinesModule } from './machines/machines.module';
import { InvestigationsModule } from './investigations/investigations.module';
import { RefsModule } from './refs/refs.module';
import { Normal_ValuesModule } from './normal_values/normal_values.module';
import { Lab_RequestsModule } from './lab_requests/lab_requests.module';
import { PatientsModule } from './patients/patients.module';
import { RequestsModule } from './requests_list/requests_list.module';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaServiceModule , UserModule , AuthModule , DomainsModule , MachinesModule , InvestigationsModule , RefsModule, Normal_ValuesModule , Lab_RequestsModule , PatientsModule , RequestsModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter
    }
  ],
})
export class AppModule {}
