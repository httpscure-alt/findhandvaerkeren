-- CreateEnum
CREATE TYPE "AdveroFulfillmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "AdveroFulfillment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "auditId" TEXT,
    "serviceLine" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "status" "AdveroFulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "companyName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "userEmail" TEXT,
    "websiteUrl" TEXT,
    "overallScore" INTEGER,
    "weakestChannel" TEXT,
    "planHeadline" TEXT,
    "notes" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdveroFulfillment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdveroFulfillment_subscriptionId_key" ON "AdveroFulfillment"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdveroFulfillment_stripeSubscriptionId_key" ON "AdveroFulfillment"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "AdveroFulfillment_workspaceId_idx" ON "AdveroFulfillment"("workspaceId");

-- CreateIndex
CREATE INDEX "AdveroFulfillment_status_idx" ON "AdveroFulfillment"("status");

-- CreateIndex
CREATE INDEX "AdveroFulfillment_serviceLine_idx" ON "AdveroFulfillment"("serviceLine");

-- CreateIndex
CREATE INDEX "AdveroFulfillment_createdAt_idx" ON "AdveroFulfillment"("createdAt");

-- AddForeignKey
ALTER TABLE "AdveroFulfillment" ADD CONSTRAINT "AdveroFulfillment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AdveroWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdveroFulfillment" ADD CONSTRAINT "AdveroFulfillment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "AdveroSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
