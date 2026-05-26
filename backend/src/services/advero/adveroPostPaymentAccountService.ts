import crypto from 'crypto';
import { prisma, isAdveroPrismaReady } from '../../prisma/client';
import { hashPassword } from '../../utils/password';
import { emailService } from '../emailService';
import { logger } from '../../config/logger';

function siteUrl(): string {
  return (process.env.ADVERO_SITE_URL || process.env.FRONTEND_URL || 'https://advero.dk').replace(
    /\/$/,
    ''
  );
}

async function issuePasswordSetupToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    },
  });

  return rawToken;
}

export type ProvisionAdveroAccountResult = {
  userId: string;
  created: boolean;
  email: string;
};

/**
 * After Stripe checkout: find or create CONSUMER, mark verified, email set-password link.
 */
export async function provisionAdveroAccountAfterPayment(opts: {
  email: string;
  companyName: string;
  auditId?: string;
}): Promise<ProvisionAdveroAccountResult> {
  const email = opts.email.trim().toLowerCase();
  if (!email.includes('@')) {
    throw new Error('Invalid email for account provisioning');
  }

  const companyName = opts.companyName.trim() || email.split('@')[0] || 'Advero kunde';

  let user = await prisma.user.findUnique({ where: { email } });
  let created = false;

  if (!user) {
    const placeholderPassword = crypto.randomBytes(32).toString('hex');
    user = await prisma.user.create({
      data: {
        email,
        name: companyName,
        password: await hashPassword(placeholderPassword),
        role: 'CONSUMER',
        isVerified: true,
      },
    });
    created = true;
    logger.info('Advero post-payment user created', { userId: user.id, email });
  } else if (!user.isVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null },
    });
  }

  const rawToken = await issuePasswordSetupToken(user.id);
  const resetUrl = `${siteUrl()}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  try {
    await emailService.sendAdveroPostPaymentWelcomeEmail(email, resetUrl, {
      brand: 'advero',
      name: user.name || companyName,
    });
  } catch (mailErr) {
    logger.error('Post-payment welcome email failed', { email, mailErr });
  }

  if (opts.auditId && isAdveroPrismaReady()) {
    try {
      await prisma.adveroAudit.updateMany({
        where: { id: opts.auditId },
        data: { userId: user.id },
      });
    } catch (auditErr) {
      logger.warn('Could not link audit to user after payment', { auditId: opts.auditId, auditErr });
    }
  }

  return { userId: user.id, created, email };
}
