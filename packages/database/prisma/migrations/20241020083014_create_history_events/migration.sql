-- CreateEnum
CREATE TYPE "ContactHistoryEventType" AS ENUM ('CREATED', 'UPDATED', 'NOTE');

-- CreateTable
CREATE TABLE "contact_history_events" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ContactHistoryEventType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_history_events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contact_history_events" ADD CONSTRAINT "contact_history_events_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_history_events" ADD CONSTRAINT "contact_history_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
