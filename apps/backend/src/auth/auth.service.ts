import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { randomBytes } from 'crypto';
import { generateSecret, generateURI, verify } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async onModuleInit() {
    // Create default super admin if none exists
    const adminExists = await this.prisma.user.findFirst({
      where: { role: 'SUPER_USER' }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.prisma.user.create({
        data: {
          email: 'admin@digitaltechsouls.com',
          password: hashedPassword,
          role: 'SUPER_USER',
          permissions: JSON.stringify(["ALL"]),
          affiliateCode: 'ADMIN'
        }
      });
      console.log("Default Super Admin created: admin@digitaltechsouls.com / admin123");
    }
  }

  async login(loginDto: any) {
    const identifier = loginDto.email || loginDto.username || loginDto.phone || loginDto.identifier;
    
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      permissions: user.permissions
    };

    if (user.isTwoFactorEnabled) {
      // Issue a temporary token meant ONLY for 2FA verification
      const tempPayload = { sub: user.id, isTwoFactorPending: true };
      return {
        requires2FA: true,
        tempToken: await this.jwtService.signAsync(tempPayload, { expiresIn: '5m' })
      };
    }

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions)
      }
    };
  }

  // --- 2FA Methods ---
  
  async generateTwoFactorSecret(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = generateSecret();
    const otpauthUrl = generateURI({ issuer: 'Digital Tech Souls', label: user.email, secret });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    });

    return {
      secret,
      qrCodeUrl: await qrcode.toDataURL(otpauthUrl)
    };
  }

  async turnOnTwoFactor(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new BadRequestException('2FA not configured');

    const isCodeValid = verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true }
    });

    return { success: true };
  }

  async turnOffTwoFactor(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new BadRequestException('2FA not configured');

    const isCodeValid = verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null }
    });

    return { success: true };
  }

  async authenticate2FA(tempToken: string, code: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(tempToken);
      if (!decoded.isTwoFactorPending) throw new UnauthorizedException('Invalid token');

      const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user || !user.twoFactorSecret) throw new UnauthorizedException('User not found or 2FA not enabled');

      const isCodeValid = verify({
        token: code,
        secret: user.twoFactorSecret
      });

      if (!isCodeValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }

      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        permissions: user.permissions
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: JSON.parse(user.permissions)
        }
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid token or code');
    }
  }

  async register(registerDto: any) {
    // Check if email, username or phone already exists
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          ...(registerDto.username ? [{ username: registerDto.username }] : []),
          ...(registerDto.phone ? [{ phone: registerDto.phone }] : [])
        ]
      }
    });

    if (existing) {
      throw new BadRequestException('Email, Username or Phone already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    let referredById = null;
    if (registerDto.referredByCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { affiliateCode: registerDto.referredByCode }
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    if (!registerDto.phone) {
      throw new BadRequestException('Phone number is required');
    }

    let user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username || null,
        phone: registerDto.phone,
        password: hashedPassword,
        profilePicture: registerDto.profilePicture || null,
        role: 'NORMAL_USER',
        affiliateCode: 'TEMP', // Will update right after
        referredById
      }
    });

    const paddedId = String(user.id).padStart(6, '0');
    user = await this.prisma.user.update({
      where: { id: user.id },
      data: { affiliateCode: paddedId }
    });

    this.mailService.sendWelcomeEmail(user.email, user.username || 'Customer').catch(e => console.error('Mail error', e));

    return { message: 'Registration successful' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    // Send via email
    const resetUrl = `https://www.digitaltechsouls.com/reset-password?token=${resetToken}`;
    this.mailService.sendPasswordResetEmail(email, resetUrl).catch(e => console.error('Failed to send reset email', e));

    return { message: 'If an account exists, a reset link has been sent to the email.' };
  }

  async resetPassword(resetDto: any) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: resetDto.token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return { message: 'Password reset successfully' };
  }

  // --- User Profile ---
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        profilePicture: true,
        city: true,
        country: true,
        role: true,
        isTwoFactorEnabled: true,
        customCommissionRate: true,
        createdAt: true
      }
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: number, data: any) {
    const updateData: any = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.phone) updateData.phone = data.phone;
    if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.country !== undefined) updateData.country = data.country;
    
    if (data.newPassword) {
      if (!data.currentPassword) throw new BadRequestException('Current password is required to change password');
      const userRec = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!userRec) throw new NotFoundException('User not found');
      const isPasswordValid = await bcrypt.compare(data.currentPassword, userRec.password);
      if (!isPasswordValid) throw new BadRequestException('Invalid current password');
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }
    
    // Check if phone or username exists
    if (data.username || data.phone) {
      const existing = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(data.username ? [{ username: data.username }] : []),
            ...(data.phone ? [{ phone: data.phone }] : [])
          ],
          NOT: { id: userId }
        }
      });
      if (existing) throw new BadRequestException('Username or Phone already in use by another account');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        profilePicture: true,
        city: true,
        country: true,
        role: true,
        isTwoFactorEnabled: true
      }
    });

    return user;
  }

  // --- Admin User Management ---
  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        profilePicture: true,
        city: true,
        country: true,
        role: true,
        permissions: true,
        customCommissionRate: true,
        createdAt: true
      }
    });
    return users.map(u => ({ ...u, permissions: JSON.parse(u.permissions || "[]") }));
  }

  async createUser(data: any) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.username ? [{ username: data.username }] : []),
          ...(data.phone ? [{ phone: data.phone }] : [])
        ]
      }
    });

    if (existing) {
      throw new BadRequestException('Email, Username or Phone already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    let user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username || null,
        phone: data.phone || null,
        city: data.city || null,
        country: data.country || null,
        password: hashedPassword,
        role: data.role || 'NORMAL_USER',
        permissions: data.permissions ? JSON.stringify(data.permissions) : '[]',
        affiliateCode: 'TEMP'
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        city: true,
        country: true,
        role: true,
        permissions: true,
        customCommissionRate: true
      }
    });

    const paddedId = String(user.id).padStart(6, '0');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { affiliateCode: paddedId }
    });

    return { ...user, permissions: JSON.parse(user.permissions || "[]") };
  }

  async updateUser(id: number, data: any) {
    const updateData: any = {};
    if (data.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Email already in use');
      }
      updateData.email = data.email;
    }
    if (data.role) updateData.role = data.role;
    if (data.permissions) updateData.permissions = JSON.stringify(data.permissions);
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.customCommissionRate !== undefined) {
      updateData.customCommissionRate = data.customCommissionRate === '' ? null : parseFloat(data.customCommissionRate);
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        customCommissionRate: true
      }
    });
    return { ...user, permissions: JSON.parse(user.permissions || "[]") };
  }

  async removeUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'SUPER_USER') throw new BadRequestException('Cannot remove SUPER_USER');

    await this.prisma.$transaction([
      this.prisma.withdrawal.deleteMany({ where: { userId: id } }),
      this.prisma.order.deleteMany({ where: { userId: id } }),
      this.prisma.license.deleteMany({ where: { userId: id } }),
      this.prisma.ticketMessage.deleteMany({ where: { userId: id } }),
      this.prisma.ticket.deleteMany({ where: { userId: id } }),
      this.prisma.subscription.deleteMany({ where: { userId: id } }),
      this.prisma.invoice.deleteMany({ where: { userId: id } }),
      this.prisma.user.updateMany({ where: { referredById: id }, data: { referredById: null } }),
      this.prisma.user.delete({ where: { id } })
    ]);
    return { success: true };
  }

  async impersonateUser(targetUserId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      permissions: user.permissions
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions)
      }
    };
  }
}
