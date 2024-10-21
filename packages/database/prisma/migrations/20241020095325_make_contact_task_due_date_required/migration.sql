/*
  Warnings:

  - Made the column `dueAt` on table `contact_tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "contact_tasks" ALTER COLUMN "dueAt" SET NOT NULL;
