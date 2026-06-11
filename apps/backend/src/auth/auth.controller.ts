import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: Record<string, any>) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: Record<string, any>) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetDto: Record<string, any>) {
    return this.authService.resetPassword(resetDto);
  }

  // --- 2FA Endpoints ---

  @UseGuards(JwtAuthGuard)
  @Get('2fa/generate')
  generateTwoFactorSecret(@Request() req: any) {
    return this.authService.generateTwoFactorSecret(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  turnOnTwoFactor(@Request() req: any, @Body() body: { code: string }) {
    return this.authService.turnOnTwoFactor(req.user.id, body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-off')
  turnOffTwoFactor(@Request() req: any, @Body() body: { code: string }) {
    return this.authService.turnOffTwoFactor(req.user.id, body.code);
  }

  @HttpCode(HttpStatus.OK)
  @Post('2fa/authenticate')
  authenticate2FA(@Body() body: { tempToken: string; code: string }) {
    return this.authService.authenticate2FA(body.tempToken, body.code);
  }

  // --- User Profile ---
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.authService.updateProfile(req.user.id, body);
  }

  // --- Admin User Management ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Get('users')
  getUsers() {
    return this.authService.getUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER')
  @Post('users')
  createUser(@Body() createDto: any) {
    return this.authService.createUser(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER')
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() updateDto: any) {
    return this.authService.updateUser(Number(id), updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER')
  @Post('impersonate/:id')
  impersonateUser(@Param('id') id: string) {
    return this.authService.impersonateUser(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER')
  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.authService.removeUser(Number(id));
  }
}
