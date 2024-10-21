-- CreateTable
CREATE TABLE "contact_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContactToContactGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContactToContactGroup_AB_unique" ON "_ContactToContactGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_ContactToContactGroup_B_index" ON "_ContactToContactGroup"("B");

-- AddForeignKey
ALTER TABLE "contact_groups" ADD CONSTRAINT "contact_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToContactGroup" ADD CONSTRAINT "_ContactToContactGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToContactGroup" ADD CONSTRAINT "_ContactToContactGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "contact_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
