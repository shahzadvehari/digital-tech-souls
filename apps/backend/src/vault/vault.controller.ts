import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { VaultService } from './vault.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('my-items')
  async getMyVaultItems(@Request() req: any) {
    return this.vaultService.getUserVaultItems(req.user.id);
  }
}
