-- CreateEnum
CREATE TYPE "ContactTaskStatus" AS ENUM ('PENDING', 'DONE');

-- AlterTable
ALTER TABLE "contact_tasks" ADD COLUMN     "status" "ContactTaskStatus" NOT NULL DEFAULT 'PENDING';
