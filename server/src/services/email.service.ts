import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailConfig {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } =
      process.env;

    // Check if email is configured
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
      this.logger.warn(
        'Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM environment variables to enable email notifications.',
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      this.isConfigured = true;
      this.logger.log('Email service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(config: EmailConfig): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      this.logger.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: Array.isArray(config.to) ? config.to.join(', ') : config.to,
        subject: config.subject,
        text: config.text || this.htmlToPlainText(config.html),
        html: config.html,
      });

      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  private htmlToPlainText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  async sendAssignmentNotification(
    agentEmail: string,
    agentName: string,
    conversationId: string,
    userName: string,
    assignmentType: 'AUTOMATIC' | 'MANUAL',
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FFA500; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { background-color: #FFA500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .info-box { background-color: white; padding: 15px; border-left: 4px solid #FFA500; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 New Conversation Assignment</h2>
          </div>
          <div class="content">
            <p>Hello <strong>${agentName}</strong>,</p>
            <p>A new conversation has been ${assignmentType === 'AUTOMATIC' ? 'automatically' : 'manually'} assigned to you.</p>

            <div class="info-box">
              <p><strong>User:</strong> ${userName}</p>
              <p><strong>Conversation ID:</strong> ${conversationId}</p>
              <p><strong>Assignment Type:</strong> ${assignmentType}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>Please log in to your agent dashboard to respond to this conversation.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/agent" class="button">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Honey Health Chatbot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      from: process.env.EMAIL_FROM!,
      to: agentEmail,
      subject: '🔔 New Conversation Assigned',
      html,
    });
  }

  async sendEscalationAlert(
    adminEmail: string,
    conversationId: string,
    userName: string,
    agentName: string,
    reason: string,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .alert-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ Conversation Escalation Alert</h2>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>A conversation has been escalated and requires your immediate attention.</p>

            <div class="alert-box">
              <p><strong>User:</strong> ${userName}</p>
              <p><strong>Agent:</strong> ${agentName}</p>
              <p><strong>Conversation ID:</strong> ${conversationId}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>Please review this conversation and take appropriate action.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" class="button">Review Conversation</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Honey Health Chatbot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      from: process.env.EMAIL_FROM!,
      to: adminEmail,
      subject: '⚠️ Conversation Escalation Alert',
      html,
    });
  }

  async sendQueueOverflowWarning(
    adminEmail: string,
    queueSize: number,
    threshold: number,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff9800; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { background-color: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .warning-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📊 Queue Overflow Warning</h2>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>The conversation queue has exceeded the warning threshold.</p>

            <div class="warning-box">
              <p><strong>Current Queue Size:</strong> ${queueSize} conversations</p>
              <p><strong>Threshold:</strong> ${threshold} conversations</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>Consider onboarding more agents or redistributing the current workload to reduce wait times.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" class="button">Manage Queue</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Honey Health Chatbot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      from: process.env.EMAIL_FROM!,
      to: adminEmail,
      subject: '📊 Queue Overflow Warning',
      html,
    });
  }
}
