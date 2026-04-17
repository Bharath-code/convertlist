-- CreateEnum
CREATE TYPE "MagnetType" AS ENUM ('CHECKLIST', 'EMAIL_TEMPLATES', 'PLAYBOOK');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'PRO_PLUS', 'LAUNCH');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "Segment" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('UNCONTACTED', 'CONTACTED', 'REPLIED', 'INTERESTED', 'PAID');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "planExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productHistory" TEXT,
    "crossProductBehavior" TEXT,
    "superUserScore" DOUBLE PRECISION,
    "lifetimeValuePrediction" DOUBLE PRECISION,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "processedLeads" INTEGER NOT NULL DEFAULT 0,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "launchReadinessScore" DOUBLE PRECISION,
    "recommendedLaunchDate" TIMESTAMP(3),
    "engagementHeatmap" TEXT,
    "seasonalityData" TEXT,
    "recommendedPricePoint" TEXT,
    "priceConfidence" DOUBLE PRECISION,
    "willingnessToPayScore" DOUBLE PRECISION,
    "discountStrategy" TEXT,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "signupNote" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3),
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER,
    "confidence" "Confidence",
    "reason" TEXT,
    "segment" "Segment",
    "status" "LeadStatus" NOT NULL DEFAULT 'UNCONTACTED',
    "sequenceId" TEXT,
    "replyForwarder" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "linkedinUrl" TEXT,
    "companySize" TEXT,
    "techStack" TEXT,
    "fundingStatus" TEXT,
    "twitterFollowers" INTEGER,
    "githubActivity" INTEGER,
    "socialProofScore" INTEGER,
    "enrichedAt" TIMESTAMP(3),
    "enrichmentConfidence" DOUBLE PRECISION,
    "useCaseCluster" TEXT,
    "painPointTribe" TEXT,
    "lookalikeGroupId" TEXT,
    "clusterConfidence" DOUBLE PRECISION,
    "demoScript" TEXT,
    "featurePriority" TEXT,
    "objectionHandling" TEXT,
    "timelinePrediction" TEXT,
    "viralityScore" INTEGER,
    "sharePropensity" DOUBLE PRECISION,
    "networkReach" INTEGER,
    "advocatePotential" DOUBLE PRECISION,
    "detectedCompetitors" TEXT,
    "competitorFeatures" TEXT,
    "switchingCost" TEXT,
    "competitorConfidence" DOUBLE PRECISION,
    "relatedLeads" TEXT,
    "companyRelationships" TEXT,
    "communityOverlap" TEXT,
    "influenceScore" DOUBLE PRECISION,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sequence" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceStep" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadStatusHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fromStatus" "LeadStatus",
    "toStatus" "LeadStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversionAnalytics" (
    "id" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "signalValue" TEXT NOT NULL,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "convertedLeads" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversionAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadMagnetCapture" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "magnetType" "MagnetType" NOT NULL,
    "name" TEXT,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadMagnetCapture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_replyForwarder_key" ON "Lead"("replyForwarder");

-- CreateIndex
CREATE INDEX "Lead_waitlistId_idx" ON "Lead"("waitlistId");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Sequence_waitlistId_idx" ON "Sequence"("waitlistId");

-- CreateIndex
CREATE INDEX "SequenceStep_sequenceId_idx" ON "SequenceStep"("sequenceId");

-- CreateIndex
CREATE INDEX "LeadStatusHistory_leadId_idx" ON "LeadStatusHistory"("leadId");

-- CreateIndex
CREATE INDEX "ConversionAnalytics_signalType_idx" ON "ConversionAnalytics"("signalType");

-- CreateIndex
CREATE UNIQUE INDEX "ConversionAnalytics_signalType_signalValue_key" ON "ConversionAnalytics"("signalType", "signalValue");

-- CreateIndex
CREATE INDEX "LeadMagnetCapture_email_idx" ON "LeadMagnetCapture"("email");

-- CreateIndex
CREATE INDEX "LeadMagnetCapture_magnetType_idx" ON "LeadMagnetCapture"("magnetType");

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sequence" ADD CONSTRAINT "Sequence_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceStep" ADD CONSTRAINT "SequenceStep_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStatusHistory" ADD CONSTRAINT "LeadStatusHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
