import { Module } from '@nestjs/common';
import { ClientLogosService } from './client-logos.service';
import { ClientLogosController } from './client-logos.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ClientLogosController],
  providers: [ClientLogosService, PrismaService],
})
export class ClientLogosModule {}
