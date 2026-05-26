-- Advero P0 foundation (run on Supabase Postgres or via prisma migrate)
-- Prefer: cd backend && npx prisma db push

CREATE TYPE "AdveroAuditStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED');

CREATE TABLE IF NOT EXISTS "AdveroWorkspace" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "companyName" TEXT NOT NULL,
  "contactEmail" TEXT,
  "setupState" JSONB NOT NULL DEFAULT '{}',
  "initializedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdveroWorkspace_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdveroWorkspace_userId_key" ON "AdveroWorkspace"("userId");

CREATE TABLE IF NOT EXISTS "AdveroAudit" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT,
  "userId" TEXT,
  "status" "AdveroAuditStatus" NOT NULL DEFAULT 'PENDING',
  "jobAttempts" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "companyName" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "serviceArea" TEXT,
  "industry" TEXT NOT NULL DEFAULT 'unknown',
  "growthGoal" TEXT NOT NULL DEFAULT 'both',
  "contactEmail" TEXT,
  "engine" TEXT,
  "scoreSearch" INTEGER,
  "scoreLocal" INTEGER,
  "scoreAi" INTEGER,
  "scoreWeb" INTEGER,
  "overallScore" INTEGER,
  "delta" TEXT,
  "topRecommendation" TEXT,
  "recommendationJson" JSONB,
  "interpretationJson" JSONB,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdveroAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdveroAudit_status_idx" ON "AdveroAudit"("status");
CREATE INDEX IF NOT EXISTS "AdveroAudit_userId_idx" ON "AdveroAudit"("userId");

CREATE TABLE IF NOT EXISTS "AdveroAuditFinding" (
  "id" TEXT NOT NULL,
  "auditId" TEXT NOT NULL,
  "checkId" TEXT NOT NULL,
  "labelDa" TEXT NOT NULL,
  "labelEn" TEXT NOT NULL,
  "statusDa" TEXT NOT NULL,
  "statusEn" TEXT NOT NULL,
  "ok" BOOLEAN NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AdveroAuditFinding_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdveroAuditFinding_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "AdveroAudit"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AdveroSubscription" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "tierId" TEXT NOT NULL,
  "serviceLine" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "billingCycle" TEXT,
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdveroSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdveroSubscription_stripeSubscriptionId_key" ON "AdveroSubscription"("stripeSubscriptionId");

CREATE TABLE IF NOT EXISTS "AdveroActivityEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "titleDa" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdveroActivityEvent_pkey" PRIMARY KEY ("id")
);
