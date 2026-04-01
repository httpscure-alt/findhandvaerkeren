-- CreateTable
CREATE TABLE "MarketingSubscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingTransaction" (
    "id" TEXT NOT NULL,
    "marketingSubscriptionId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'dkk',
    "status" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingSubscription_stripeSubscriptionId_key" ON "MarketingSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "MarketingSubscription_companyId_idx" ON "MarketingSubscription"("companyId");

-- CreateIndex
CREATE INDEX "MarketingSubscription_serviceType_idx" ON "MarketingSubscription"("serviceType");

-- CreateIndex
CREATE INDEX "MarketingSubscription_status_idx" ON "MarketingSubscription"("status");

-- CreateIndex
CREATE INDEX "MarketingSubscription_stripeSubscriptionId_idx" ON "MarketingSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "MarketingTransaction_marketingSubscriptionId_idx" ON "MarketingTransaction"("marketingSubscriptionId");

-- CreateIndex
CREATE INDEX "MarketingTransaction_companyId_idx" ON "MarketingTransaction"("companyId");

-- CreateIndex
CREATE INDEX "MarketingTransaction_status_idx" ON "MarketingTransaction"("status");

-- CreateIndex
CREATE INDEX "MarketingTransaction_createdAt_idx" ON "MarketingTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "MarketingSubscription" ADD CONSTRAINT "MarketingSubscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingTransaction" ADD CONSTRAINT "MarketingTransaction_marketingSubscriptionId_fkey" FOREIGN KEY ("marketingSubscriptionId") REFERENCES "MarketingSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingTransaction" ADD CONSTRAINT "MarketingTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
