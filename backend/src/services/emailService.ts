import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';
import { logger } from '../config/logger';
import {
  renderAdveroOtpEmail,
  renderAdveroWelcomeEmail,
  renderAdveroPostPaymentWelcomeEmail,
  renderAdveroPasswordResetEmail,
  renderAdveroPasswordResetSuccessEmail,
  renderAdveroPaymentReceiptEmail,
  renderAdveroPaymentFailedEmail,
  renderAdveroSubscriptionActivatedEmail,
  renderAdveroAuditReportPreviewEmail,
  renderAdveroAuditReportFullEmail,
  renderAdveroOpsFulfillmentEmail,
  type AuditReportEmailData,
  type OpsFulfillmentEmailData,
} from '../emails/adveroEmails';
import { enrichPreviewEmailWithRecommendation } from './auditRecommendation';

export type EmailBrand = 'advero';

export interface EmailSendOptions {
  brand?: EmailBrand;
  name?: string | null;
}

export interface PaymentSuccessData {
  companyName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  tier: string;
  invoiceId?: string;
}

export interface PaymentFailedData {
  companyName: string;
  amount: number;
  currency: string;
  failureReason: string;
  invoiceUrl?: string;
}

export interface SubscriptionActivatedData {
  companyName: string;
  tier: string;
  billingCycle: string;
}

interface EmailProvider {
  sendHtml(to: string, subject: string, html: string): Promise<void>;
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://findhandvaerkeren.dk';

function fromAddress(): string {
  return process.env.ADVERO_FROM_EMAIL || process.env.FROM_EMAIL || 'Advero <hello@advero.dk>';
}

class ConsoleEmailProvider implements EmailProvider {
  async sendHtml(to: string, subject: string, html: string): Promise<void> {
    logger.info(`[EMAIL] to=${to} subject=${subject} (${html.length} bytes html)`);
  }
}

class ResendEmailProvider implements EmailProvider {
  private resend: Resend;
  private defaultFrom: string;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
    this.defaultFrom = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  }

  async sendHtml(to: string, subject: string, html: string, from?: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: from || this.defaultFrom,
      to,
      subject,
      html,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}

class EmailService {
  private provider: ResendEmailProvider | ConsoleEmailProvider;
  private useResend: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.useResend = Boolean(apiKey);
    if (apiKey) {
      this.provider = new ResendEmailProvider(apiKey);
      logger.info('Email service initialized with Resend');
    } else {
      this.provider = new ConsoleEmailProvider();
      logger.info('Email service initialized with console provider');
    }
  }

  private async dispatch(to: string, subject: string, html: string): Promise<void> {
    const from = fromAddress();
    if (this.useResend) {
      await (this.provider as ResendEmailProvider).sendHtml(to, subject, html, from);
    } else {
      await this.provider.sendHtml(to, subject, html);
    }
  }

  async sendOtpEmail(to: string, code: string, options: EmailSendOptions = {}): Promise<void> {
    try {
      const { subject, html } = renderAdveroOtpEmail({ name: options.name, email: to, code });
      await this.dispatch(to, subject, html);
      logger.info(`OTP email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(to: string, options: EmailSendOptions = {}): Promise<void> {
    try {
      const { subject, html } = renderAdveroWelcomeEmail({ name: options.name, email: to });
      await this.dispatch(to, subject, html);
      logger.info(`Welcome email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }
  }

  async sendAdveroPostPaymentWelcomeEmail(
    to: string,
    resetUrl: string,
    options: EmailSendOptions = {}
  ): Promise<void> {
    try {
      const { subject, html } = renderAdveroPostPaymentWelcomeEmail({
        name: options.name,
        email: to,
        resetUrl,
      });
      await this.dispatch(to, subject, html);
      logger.info(`Advero post-payment welcome email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send post-payment welcome email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, options: EmailSendOptions = {}): Promise<void> {
    try {
      const { subject, html } = renderAdveroPasswordResetEmail({ name: options.name, email: to, resetUrl });
      await this.dispatch(to, subject, html);
      logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
    }
  }

  async sendPasswordResetSuccessEmail(to: string, options: EmailSendOptions = {}): Promise<void> {
    try {
      const { subject, html } = renderAdveroPasswordResetSuccessEmail({ name: options.name, email: to });
      await this.dispatch(to, subject, html);
      logger.info(`Password reset success email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send password reset success email:', error);
    }
  }

  async sendAuditReportPreviewEmail(
    to: string,
    data: AuditReportEmailData,
    opts?: { goal?: import('../lib/recommendPlan').GrowthGoal; industry?: import('../lib/recommendPlan').IndustryCategory }
  ): Promise<void> {
    try {
      const enriched = enrichPreviewEmailWithRecommendation(data, opts);
      const { subject, html } = renderAdveroAuditReportPreviewEmail(enriched);
      await this.dispatch(to, subject, html);
      logger.info(`Audit preview report email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send audit preview report email:', error);
    }
  }

  async sendAuditReportFullEmail(to: string, data: AuditReportEmailData): Promise<void> {
    try {
      const { subject, html } = renderAdveroAuditReportFullEmail({ ...data, email: to });
      await this.dispatch(to, subject, html);
      logger.info(`Audit full report email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send audit full report email:', error);
    }
  }

  async sendInquiryEmail(to: string, companyName: string, message: string): Promise<void> {
    try {
      await this.dispatch(
        to,
        `Ny forespørgsel til ${companyName}`,
        `
          <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0F172A;">Ny forespørgsel modtaget</h2>
            <p>Du har modtaget en ny forespørgsel til <strong>${companyName}</strong>.</p>
            <div style="padding: 15px; background-color: #f8fafc; border-radius: 12px; margin-top: 10px;">
              <p style="margin: 0;">${message}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="${FRONTEND_URL}/dashboard" style="background-color: #334155; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Se i dashboard</a>
            </p>
          </div>
        `
      );
      logger.info(`Inquiry email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send inquiry email:', error);
    }
  }

  async sendPaymentSuccessEmail(
    to: string,
    data: PaymentSuccessData,
    options: EmailSendOptions = {}
  ): Promise<void> {
    try {
      const formattedAmount = new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: data.currency.toUpperCase(),
      }).format(data.amount);
      const { subject, html } = renderAdveroPaymentReceiptEmail({
        name: options.name,
        email: to,
        plan: data.tier,
        amount: formattedAmount,
        invoiceId: data.invoiceId || data.companyName,
      });
      await this.dispatch(to, subject, html);
      logger.info(`Payment success email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send payment success email:', error);
    }
  }

  async sendPaymentFailedEmail(
    to: string,
    data: PaymentFailedData,
    options: EmailSendOptions = {}
  ): Promise<void> {
    try {
      const formattedAmount = new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: data.currency.toUpperCase(),
      }).format(data.amount);

      const { subject, html } = renderAdveroPaymentFailedEmail({
        name: options.name,
        email: to,
        amount: formattedAmount,
        reason: data.failureReason,
        actionUrl: data.invoiceUrl,
      });
      await this.dispatch(to, subject, html);
      logger.info(`Payment failed email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send payment failed email:', error);
    }
  }

  async sendSubscriptionActivatedEmail(
    to: string,
    data: SubscriptionActivatedData,
    options: EmailSendOptions = {}
  ): Promise<void> {
    try {
      const { subject, html } = renderAdveroSubscriptionActivatedEmail({
        name: options.name,
        email: to,
        tier: data.tier,
        companyName: data.companyName,
      });
      await this.dispatch(to, subject, html);
      logger.info(`Subscription activated email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send subscription activated email:', error);
    }
  }

  async sendOpsFulfillmentEmail(to: string | string[], data: OpsFulfillmentEmailData): Promise<void> {
    const recipients = Array.isArray(to) ? to : [to];
    if (!recipients.length) return;
    try {
      const { subject, html } = renderAdveroOpsFulfillmentEmail(data);
      for (const email of recipients) {
        await this.dispatch(email, subject, html);
      }
      logger.info(`Ops fulfillment email sent to ${recipients.join(', ')}`);
    } catch (error) {
      logger.error('Failed to send ops fulfillment email:', error);
    }
  }
}

export const emailService = new EmailService();
