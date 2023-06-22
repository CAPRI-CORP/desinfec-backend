-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cost" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expenses_name_key" ON "expenses"("name");
