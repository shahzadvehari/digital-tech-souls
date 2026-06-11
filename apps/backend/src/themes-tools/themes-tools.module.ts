import { Module } from '@nestjs/common';
import { ThemesToolsController } from './themes-tools.controller';
import { ThemesToolsService } from './themes-tools.service';
import { PrismaModule } from '../prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ThemesToolsController],
  providers: [ThemesToolsService],
})
export class ThemesToolsModule {}
