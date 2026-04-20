import { prisma } from '../prisma/client';

export type LeadMatchCandidate = {
  id: string;
  location: string;
  businessAddress: string | null;
  isVerified: boolean;
  pricingTier: 'Basic' | 'Gold';
  rating: number;
  reviewCount: number;
  createdAt: Date;
};

export function normalizePostal(raw: unknown): string | null {
  const s = String(raw || '').trim();
  const m = s.match(/\b(\d{4})\b/);
  return m ? m[1] : null;
}

export function inferCompanyPostal(company: { businessAddress?: unknown; location?: unknown }): string | null {
  return normalizePostal(company.businessAddress) || normalizePostal(company.location) || null;
}

export async function selectCompaniesForJobRequest(args: {
  category: string;
  postalCode: string;
  min?: number;
  max?: number;
}) {
  const { category, postalCode, min = 3, max = 5 } = args;
  const jobPostal = normalizePostal(postalCode);

  const candidates = await prisma.company.findMany({
    where: {
      category,
      companyCreated: true,
      onboardingCompleted: true,
    },
    select: {
      id: true,
      location: true,
      businessAddress: true,
      isVerified: true,
      pricingTier: true,
      rating: true,
      reviewCount: true,
      createdAt: true,
    },
  });

  const scored = candidates.map((c) => {
    const cPostal = inferCompanyPostal(c);
    const dist = jobPostal && cPostal ? Math.abs(Number(jobPostal) - Number(cPostal)) : Number.POSITIVE_INFINITY;
    return { company: c as LeadMatchCandidate, dist };
  });

  scored.sort((a, b) => {
    if (a.dist !== b.dist) return a.dist - b.dist;
    if (a.company.isVerified !== b.company.isVerified) return a.company.isVerified ? -1 : 1;
    if (a.company.pricingTier !== b.company.pricingTier) return a.company.pricingTier === 'Gold' ? -1 : 1;
    if (a.company.rating !== b.company.rating) return b.company.rating - a.company.rating;
    if (a.company.reviewCount !== b.company.reviewCount) return b.company.reviewCount - a.company.reviewCount;
    return a.company.createdAt.getTime() - b.company.createdAt.getTime();
  });

  const available = scored.map((s) => s.company);
  const targetCount = Math.min(max, Math.max(min, available.length));
  return available.slice(0, targetCount);
}

