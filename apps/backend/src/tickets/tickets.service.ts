import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { TicketsGateway } from './tickets.gateway';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private gateway: TicketsGateway
  ) {}

  async createGuestTicket(data: { name: string, email: string, subject: string, priority: string, message: string, phone?: string, city?: string, country?: string }) {
    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    
    if (!user) {
      const tempPassword = Math.random().toString(36).slice(-10);
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.name,
          phone: data.phone || null,
          city: data.city || null,
          country: data.country || null,
          password: tempPassword,
          role: 'NORMAL_USER'
        }
      });
    } else {
      const updateData: any = {};
      if (data.phone && !user.phone) updateData.phone = data.phone;
      if (data.city && !user.city) updateData.city = data.city;
      if (data.country && !user.country) updateData.country = data.country;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      }
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        subject: data.subject,
        priority: data.priority || 'MEDIUM',
        status: 'OPEN',
        userId: user.id,
        messages: {
          create: {
            message: data.message,
            userId: user.id,
            isStaff: false
          }
        }
      },
      include: {
        messages: true
      }
    });

    await this.prisma.lead.create({
      data: {
        name: user.username || data.name,
        email: user.email,
        phone: user.phone || data.phone || 'N/A',
        city: user.city || data.city || null,
        country: user.country || data.country || null,
        message: data.message,
        serviceNeeded: `Support Ticket: ${data.subject}`,
      }
    });

    this.mailService.sendTicketConfirmation(user.email, user.username || data.name, user.id, ticket.id).catch(console.error);

    return ticket;
  }

  async create(userId: number, data: { subject: string, priority: string, message: string, phone?: string, city?: string, country?: string }) {
    const ticket = await this.prisma.ticket.create({
      data: {
        subject: data.subject,
        priority: data.priority || 'MEDIUM',
        status: 'OPEN',
        userId,
        messages: {
          create: {
            message: data.message,
            userId,
            isStaff: false
          }
        }
      },
      include: {
        messages: true
      }
    });

    let user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const updateData: any = {};
      if (data.phone && !user.phone) updateData.phone = data.phone;
      if (data.city && !user.city) updateData.city = data.city;
      if (data.country && !user.country) updateData.country = data.country;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      }

      await this.prisma.lead.create({
        data: {
          name: user.username || 'User',
          email: user.email,
          phone: user.phone || data.phone || 'N/A',
          city: user.city || data.city || null,
          country: user.country || data.country || null,
          message: data.message,
          serviceNeeded: `Support Ticket: ${data.subject}`,
        }
      });
      this.mailService.sendTicketConfirmation(user.email, user.username || 'User', user.id, ticket.id).catch(console.error);
    }

    return ticket;
  }

  async findByUser(userId: number) {
    return this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: { email: true, username: true }
        },
        _count: {
          select: { messages: true }
        }
      }
    });
  }

  async findOne(id: number, user: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: {
          include: {
            user: { select: { username: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        user: { select: { username: true, email: true } }
      }
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Ensure users can only see their own tickets unless they are admin
    if (ticket.userId !== user.userId && !['ADMIN_USER', 'SUPER_USER'].includes(user.role)) {
      throw new UnauthorizedException('You do not have access to this ticket');
    }

    return ticket;
  }

  async reply(id: number, user: any, message: string) {
    const ticket = await this.findOne(id, user); // checks access rights implicitly
    const isStaff = ['ADMIN_USER', 'SUPER_USER'].includes(user.role);

    // Update ticket status depending on who replies
    const newStatus = isStaff ? 'ANSWERED' : 'OPEN';

    await this.prisma.ticket.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    const replyObj = await this.prisma.ticketMessage.create({
      data: {
        ticketId: id,
        userId: user.userId,
        message,
        isStaff
      },
      include: {
        user: { select: { username: true, email: true, role: true } }
      }
    });

    // Notify connected clients
    this.gateway.notifyNewMessage(id, replyObj);

    if (isStaff && ticket.user) {
      this.mailService.sendTicketReplyEmail(ticket.user.email, ticket.id, ticket.subject).catch(console.error);
    }

    return replyObj;
  }

  async close(id: number, user: any) {
    await this.findOne(id, user); // check access
    return this.prisma.ticket.update({
      where: { id },
      data: { status: 'CLOSED', updatedAt: new Date() }
    });
  }

  async updateAsAdmin(id: number, data: any) {
    const updateData: any = {};
    if (data.subject) updateData.subject = data.subject;
    if (data.priority) updateData.priority = data.priority;
    if (data.status) updateData.status = data.status;
    updateData.updatedAt = new Date();

    return this.prisma.ticket.update({
      where: { id },
      data: updateData
    });
  }

  async deleteAsAdmin(id: number) {
    await this.prisma.ticketMessage.deleteMany({
      where: { ticketId: id }
    });
    return this.prisma.ticket.delete({
      where: { id }
    });
  }
}
