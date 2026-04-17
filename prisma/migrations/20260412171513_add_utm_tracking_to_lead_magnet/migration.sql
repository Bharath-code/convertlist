-- AlterTable
ALTER TABLE "LeadMagnetCapture" ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmTerm" TEXT;

-- CreateIndex
CREATE INDEX "LeadMagnetCapture_utmSource_idx" ON "LeadMagnetCapture"("utmSource");
