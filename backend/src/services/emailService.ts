import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';

interface EmailProvider {
    sendOtp(to: string, code: string): Promise<void>;
    sendInquiryNotification(to: string, companyName: string, message: string): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
    async sendOtp(to: string, code: string): Promise<void> {
        console.log('---------------------------------------------------');
        console.log(`[EMAIL SERVICE] Sending OTP to: ${to}`);
        console.log(`[EMAIL SERVICE] Code: ${code}`);
        console.log('---------------------------------------------------');
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async sendInquiryNotification(to: string, companyName: string, message: string): Promise<void> {
        console.log('---------------------------------------------------');
        console.log(`[EMAIL SERVICE] New Inquiry for: ${companyName}`);
        console.log(`[EMAIL SERVICE] Sent to owner: ${to}`);
        console.log(`[EMAIL SERVICE] Message: ${message}`);
        console.log('---------------------------------------------------');
        await new Promise(resolve => setTimeout(resolve, 500));
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
            subject: 'Your Verification Code - Findhåndværkeren',
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
        });
    }

    async sendInquiryNotification(to: string, companyName: string, message: string): Promise<void> {
        await this.resend.emails.send({
            from: this.fromEmail,
            to,
            subject: `New Inquiry for ${companyName}`,
            html: `
                <h3>New Inquiry Received</h3>
                <p>You have received a new inquiry for <strong>${companyName}</strong>.</p>
                <div style="padding: 15px; background-color: #f9f9f9; border-radius: 5px; margin-top: 10px;">
                    <p style="margin: 0;">${message}</p>
                </div>
                <p style="margin-top: 20px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #1D1D1F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard</a>
                </p>
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
        } else {
            this.provider = new ConsoleEmailProvider();
        }
    }

    async sendOtpEmail(to: string, code: string): Promise<void> {
        try {
            await this.provider.sendOtp(to, code);
            console.log(`OTP email sent successfully to ${to}`);
        } catch (error) {
            console.error('Failed to send OTP email:', error);
            throw new Error('Failed to send verification email');
        }
    }

    async sendInquiryEmail(to: string, companyName: string, message: string): Promise<void> {
        try {
            await this.provider.sendInquiryNotification(to, companyName, message);
            console.log(`Inquiry email sent successfully to ${to}`);
        } catch (error) {
            console.error('Failed to send inquiry email:', error);
            // Don't throw here to avoid blocking inquiry creation if email fails
        }
    }
}

export const emailService = new EmailService();
