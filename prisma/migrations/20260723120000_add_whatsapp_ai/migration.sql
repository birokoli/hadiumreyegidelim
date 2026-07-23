CREATE TABLE "WhatsAppConversation" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "name" TEXT,
  "status" TEXT NOT NULL DEFAULT 'AI_ACTIVE',
  "botEnabled" BOOLEAN NOT NULL DEFAULT true,
  "leadType" TEXT,
  "leadScore" INTEGER NOT NULL DEFAULT 0,
  "handoffReason" TEXT,
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsAppConversation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WhatsAppMessage" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "externalId" TEXT,
  "direction" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'customer',
  "content" TEXT NOT NULL,
  "intent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WhatsAppConversation_phone_key" ON "WhatsAppConversation"("phone");
CREATE UNIQUE INDEX "WhatsAppMessage_externalId_key" ON "WhatsAppMessage"("externalId");
CREATE INDEX "WhatsAppMessage_conversationId_createdAt_idx" ON "WhatsAppMessage"("conversationId", "createdAt");
ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsAppConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
