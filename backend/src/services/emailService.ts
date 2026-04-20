import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';
import { logger } from '../config/logger';

interface EmailProvider {
    sendOtp(to: string, code: string): Promise<void>;
    sendPasswordReset(to: string, resetUrl: string): Promise<void>;
    sendInquiryNotification(to: string, companyName: string, message: string): Promise<void>;
    sendPaymentSuccess(to: string, data: PaymentSuccessData): Promise<void>;
    sendPaymentFailed(to: string, data: PaymentFailedData): Promise<void>;
    sendSubscriptionActivated(to: string, data: SubscriptionActivatedData): Promise<void>;
}

export interface PaymentSuccessData {
    companyName: string;
    amount: number;
    currency: string;
    billingCycle: string;
    tier: string;
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

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://findhandvaerkeren.dk';

class ConsoleEmailProvider implements EmailProvider {
    async sendOtp(to: string, code: string): Promise<void> {
        logger.info(`[EMAIL] OTP sent to: ${to}, code: ${code}`);
    }

    async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
        logger.info(`[EMAIL] Password reset sent to: ${to}, url: ${resetUrl}`);
    }

    async sendInquiryNotification(to: string, companyName: string, message: string): Promise<void> {
        logger.info(`[EMAIL] Inquiry notification for ${companyName} sent to: ${to}`);
    }

    async sendPaymentSuccess(to: string, data: PaymentSuccessData): Promise<void> {
        logger.info(`[EMAIL] Payment success email sent to: ${to}`, data);
    }

    async sendPaymentFailed(to: string, data: PaymentFailedData): Promise<void> {
        logger.info(`[EMAIL] Payment failed email sent to: ${to}`, data);
    }

    async sendSubscriptionActivated(to: string, data: SubscriptionActivatedData): Promise<void> {
        logger.info(`[EMAIL] Subscription activated email sent to: ${to}`, data);
    }
}

class ResendEmailProvider implements EmailProvider {
    private resend: Resend;
    private fromEmail: string;

    constructor(apiKey: string) {
        this.resend = new Resend(apiKey);
        this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    }

    async sendOtp(to: string, code: string): Promise<void> {
        await this.resend.emails.send({
            from: this.fromEmail,
            to,
            subject: 'Din bekræftelseskode - Findhåndværkeren',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1D1D1F;">Bekræftelseskode</h2>
                    <p>Din bekræftelseskode er:</p>
                    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1D1D1F;">${code}</span>
                    </div>
                    <p style="color: #86868B;">Denne kode udløber om 10 minutter.</p>
                </div>
            `,
        });
    }

    async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
        await this.resend.emails.send({
            from: this.fromEmail,
            to,
            subject: 'Nulstil adgangskode - Findhåndværkeren',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1D1D1F;">Nulstil adgangskode</h2>
                    <p>Klik på linket herunder for at vælge en ny adgangskode:</p>
                    <p style="margin-top: 16px;">
                      <a href="${resetUrl}" style="background-color: #1D1D1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Nulstil adgangskode</a>
                    </p>
                    <p style="color: #86868B; margin-top: 16px;">Linket udløber om 60 minutter.</p>
                </div>
            `,
        });
    }

    async sendInquiryNotification(to: string, companyName: string, message: string): Promise<void> {
        await this.resend.emails.send({
            from: this.fromEmail,
            to,
            subject: `Ny forespørgsel til ${companyName}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1D1D1F;">Ny forespørgsel modtaget</h2>
                    <p>Du har modtaget en ny forespørgsel til <strong>${companyName}</strong>.</p>
                    <div style="padding: 15px; background-color: #f5f5f7; border-radius: 12px; margin-top: 10px;">
                        <p style="margin: 0;">${message}</p>
                    </div>
                    <p style="margin-top: 20px;">
                        <a href="${FRONTEND_URL}/dashboard" style="background-color: #1D1D1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Se i Dashboard</a>
                    </p>
                </div>
            `,
        });
    }

    async sendPaymentSuccess(to: string, data: PaymentSuccessData): Promise<void> {
        const formattedAmount = new Intl.NumberFormat('da-DK', {
            style: 'currency',
            currency: data.currency.toUpperCase(),
        }).format(data.amount);

        await this.resend.emails.send({
            from: this.fromEmail,
            to,
            subject: 'Betaling gennemført - Findhåndværkeren',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1D1D1F;">Betaling gennemført!</h2>
                    <p>Tak for din betaling til <strong>${data.companyName}</strong>.</p>
                    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #86868B;">Plan</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.tier}</td></tr>
                            <tr><td style="padding: 8px 0; color: #86868B;">Beløb</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${formattedAmount}</td></tr>
                            <tr><td style="padding: 8px 0; color: #86868B;">Fakturering</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.billingCycle === 'monthly' ? 'Månedlig' : 'Årlig'}</td></tr>
                        </table>
                    </div>
                    <p style="margin-top: 20px;">
                        <a href="${FRONTEND_URL}/dashboard/billing" style="background-color: #1D1D1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Se fakturering</a>
                    </p>
                </div>
            `,
        });
    }

    async sendPaymentFailed(to: string, data: PaymentFailedData): Promise<void> {
        const formattedAmount = new Intl.NumberFormat('da-DK', {
            style: 'currency',
            currency: data.currency.toUpperCase(),
        }).format(data.amount);

        await this.resend.emails.send({
            from: this.fromEmail,
            to,
            subject: 'Betaling mislykkedes - Handling påkrævet',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1D1D1F;">Betaling mislykkedes</h2>
                    <p>Vi kunne ikke gennemføre din betaling på <strong>${formattedAmount}</strong> for <strong>${data.companyName}</strong>.</p>
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #EF4444;">
                        <p style="margin: 0; color: #991B1B;">${data.failureReason}</p>
                    </div>
                    <p>Opdater venligst din betalingsmetode for at undgå afbrydelse af din tjeneste.</p>
                    ${data.invoiceUrl ? `<p style="margin-top: 20px;"><a href="${data.invoiceUrl}" style="background-color: #1D1D1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Betal faktura</a></p>` : `<p style="margin-top: 20px;"><a href="${FRONTEND_URL}/dashboard/billing" style="background-color: #1D1D1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Opdater betalingsmetode</a></p>`}
                </div>
            `,
        });
    }

    async sendSubscriptionActivated(to: string, data: SubscriptionActivatedData): Promise<void> {
        await this.resend.emails.send({
            from: this.fromEmail,
            to,
            subject: 'Abonnement aktiveret - Findhåndværkeren',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1D1D1F;">Velkommen til Findhåndværkeren!</h2>
                    <p>Dit <strong>${data.tier}</strong> abonnement for <strong>${data.companyName}</strong> er nu aktivt.</p>
                    <div style="background-color: #f5f5f7; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Næste trin:</h3>
                        <ul style="padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Fuldfør din virksomhedsprofil</li>
                            <li style="margin-bottom: 8px;">Upload verifikationsdokumenter</li>
                            <li style="margin-bottom: 8px;">Tilføj dine ydelser og portfolio</li>
                        </ul>
                    </div>
                    <p style="margin-top: 20px;">
                        <a href="${FRONTEND_URL}/dashboard" style="background-color: #1D1D1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Gå til Dashboard</a>
                    </p>
                </div>
            `,
        });
    }
}

class EmailService {
    private provider: EmailProvider;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey && process.env.NODE_ENV === 'production') {
            this.provider = new ResendEmailProvider(apiKey);
            logger.info('Email service initialized with Resend provider');
        } else {
            this.provider = new ConsoleEmailProvider();
            logger.info('Email service initialized with console provider (development mode)');
        }
    }

    async sendOtpEmail(to: string, code: string): Promise<void> {
        try {
            await this.provider.sendOtp(to, code);
            logger.info(`OTP email sent to ${to}`);
        } catch (error) {
            logger.error('Failed to send OTP email:', error);
            throw new Error('Failed to send verification email');
        }
    }

    async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
        try {
            await this.provider.sendPasswordReset(to, resetUrl);
            logger.info(`Password reset email sent to ${to}`);
        } catch (error) {
            logger.error('Failed to send password reset email:', error);
        }
    }

    async sendInquiryEmail(to: string, companyName: string, message: string): Promise<void> {
        try {
            await this.provider.sendInquiryNotification(to, companyName, message);
            logger.info(`Inquiry email sent to ${to}`);
        } catch (error) {
            logger.error('Failed to send inquiry email:', error);
        }
    }

    async sendPaymentSuccessEmail(to: string, data: PaymentSuccessData): Promise<void> {
        try {
            await this.provider.sendPaymentSuccess(to, data);
            logger.info(`Payment success email sent to ${to}`);
        } catch (error) {
            logger.error('Failed to send payment success email:', error);
        }
    }

    async sendPaymentFailedEmail(to: string, data: PaymentFailedData): Promise<void> {
        try {
            await this.provider.sendPaymentFailed(to, data);
            logger.info(`Payment failed email sent to ${to}`);
        } catch (error) {
            logger.error('Failed to send payment failed email:', error);
        }
    }

    async sendSubscriptionActivatedEmail(to: string, data: SubscriptionActivatedData): Promise<void> {
        try {
            await this.provider.sendSubscriptionActivated(to, data);
            logger.info(`Subscription activated email sent to ${to}`);
        } catch (error) {
            logger.error('Failed to send subscription activated email:', error);
        }
    }
}

export const emailService = new EmailService();
