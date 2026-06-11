import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private prisma: PrismaService) {}

  private async getTransporter() {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass']
        }
      }
    });

    const config = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);

    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      throw new Error('SMTP credentials not fully configured in settings.');
    }

    return nodemailer.createTransport({
      host: config.smtpHost,
      port: parseInt(config.smtpPort || '587', 10),
      secure: parseInt(config.smtpPort, 10) === 465, 
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  private async getFromAddress() {
    const settings = await this.prisma.setting.findMany({
      where: { key: { in: ['smtpFromName', 'smtpFromEmail'] } }
    });
    const config = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);
    
    const name = config.smtpFromName || 'Digital Tech Souls';
    const email = config.smtpFromEmail || 'noreply@digitaltechsouls.com';
    return `"${name}" <${email}>`;
  }

  async sendEmail(to: string, subject: string, htmlContent: string, attachments?: any[]) {
    try {
      const transporter = await this.getTransporter();
      const from = await this.getFromAddress();

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
        attachments,
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      return false; // Return false instead of throwing so it doesn't break user flows
    }
  }

  async sendWelcomeEmail(to: string, username: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Welcome to Digital Tech Souls!</h2>
        <p>Hi ${username || 'there'},</p>
        <p>Thank you for creating an account with us. We are excited to have you on board!</p>
        <p>You can now browse our premium hosting plans, digital licenses, and themes & tools.</p>
        <br/>
        <p>Best regards,<br/>The Digital Tech Souls Team</p>
      </div>
    `;
    return this.sendEmail(to, 'Welcome to Digital Tech Souls!', html);
  }

  async sendTicketReplyEmail(to: string, ticketId: number, subject: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Update on your Support Ticket</h2>
        <p>Hi there,</p>
        <p>Our support team has just replied to your ticket: <strong>#${ticketId} - ${subject}</strong></p>
        <p>Please log in to your dashboard to view the reply and continue the conversation.</p>
        <a href="http://localhost:3000/dashboard/tickets/${ticketId}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Ticket</a>
        <br/><br/>
        <p>Best regards,<br/>Digital Tech Souls Support</p>
      </div>
    `;
    return this.sendEmail(to, `Re: Support Ticket #${ticketId}`, html);
  }

  async sendTicketConfirmation(to: string, username: string, userId: number, ticketId: number) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #25D366;">Support Ticket Received</h2>
        <p>Hi ${username || 'there'},</p>
        <p>We have successfully received your support request (Ticket #${ticketId}).</p>
        <p>For your reference, your <strong>User ID is: ${userId}</strong>.</p>
        <p>Our team will review your ticket and reply shortly. You can track the status by logging into your dashboard.</p>
        <br/>
        <p>Best regards,<br/>Digital Tech Souls Support</p>
      </div>
    `;
    return this.sendEmail(to, `Ticket Received - #${ticketId}`, html);
  }

  async sendOrderPaidEmail(to: string, orderId: number, amount: number, currency: string, invoiceBuffer?: Buffer) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #16a34a;">Payment Received - Order #${orderId}</h2>
        <p>Hi there,</p>
        <p>We have successfully received your payment of <strong>${currency === 'PKR' ? 'Rs.' : '$'}${amount}</strong> for Order #${orderId}.</p>
        <p>Your digital products and licenses are now available for download in your dashboard!</p>
        <p>An invoice for your purchase is attached to this email.</p>
        <a href="http://localhost:3000/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
        <br/><br/>
        <p>Thank you for your business!<br/>Digital Tech Souls</p>
      </div>
    `;

    const attachments = invoiceBuffer ? [
      {
        filename: `Invoice-${orderId}.pdf`,
        content: invoiceBuffer,
        contentType: 'application/pdf'
      }
    ] : undefined;

    return this.sendEmail(to, `Payment Received - Order #${orderId}`, html, attachments);
  }

  async sendInvoiceEmail(to: string, invoiceId: number, amount: number, currency: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Invoice Notification</h2>
        <p>Hi there,</p>
        <p>This is a notification regarding Invoice <strong>#${invoiceId}</strong> for the amount of <strong>${currency === 'PKR' ? 'Rs.' : '$'}${amount}</strong>.</p>
        <p>You can view, download, or pay this invoice by logging into your dashboard.</p>
        <a href="http://localhost:3000/dashboard/invoices" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Invoice</a>
        <br/><br/>
        <p>Thank you for your business!<br/>Digital Tech Souls</p>
      </div>
    `;
    return this.sendEmail(to, `Invoice Notification - #${invoiceId}`, html);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi there,</p>
        <p>We received a request to reset the password associated with this email address.</p>
        <p>If you made this request, please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <br/>
        <p>Best regards,<br/>The Digital Tech Souls Team</p>
      </div>
    `;
    return this.sendEmail(to, 'Password Reset Request - Digital Tech Souls', html);
  }

  async testSmtp(to: string) {
    try {
      const transporter = await this.getTransporter();
      const from = await this.getFromAddress();

      const info = await transporter.sendMail({
        from,
        to,
        subject: 'Digital Tech Souls - SMTP Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">SMTP Configuration Successful!</h2>
            <p>If you are reading this email, it means your SMTP settings in the Digital Tech Souls Admin Panel are working perfectly.</p>
            <p>The system is now ready to dispatch real emails.</p>
            <br/>
            <p>Best regards,<br/>The System</p>
          </div>
        `
      });

      this.logger.log(`Test email sent to ${to}: ${info.messageId}`);
      return { success: true, message: 'Test email dispatched successfully.' };
    } catch (error) {
      this.logger.error(`Failed to send test email to ${to}`, error.stack);
      return { success: false, message: error.message || 'Unknown SMTP error occurred.' };
    }
  }
}
