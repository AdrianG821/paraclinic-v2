import { Module } from "@nestjs/common";
import { UsersService } from './users.service';
import { PrismaServiceModule } from "prisma/prisma.module";


@Module({
  imports:  [PrismaServiceModule],
  providers: [UsersService],
  exports: [UsersService]
})
export class UserModule {}