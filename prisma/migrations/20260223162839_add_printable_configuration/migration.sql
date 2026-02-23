/*
  Warnings:

  - A unique constraint covering the columns `[request_id,investigation_id,ref_id]` on the table `Results` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sent` to the `Lab_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Pacients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machine_id` to the `Results` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Results" DROP CONSTRAINT "Results_ref_id_fkey";

-- AlterTable
ALTER TABLE "Lab_requests" ADD COLUMN     "cas_code" TEXT,
ADD COLUMN     "cas_date" TEXT,
ADD COLUMN     "cas_diagnostic" TEXT,
ADD COLUMN     "cas_number" TEXT,
ADD COLUMN     "sent" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Pacients" ADD COLUMN     "sex" "Sex" NOT NULL;

-- AlterTable
ALTER TABLE "Refs" ADD COLUMN     "um" TEXT;

-- AlterTable
ALTER TABLE "Results" ADD COLUMN     "machine_id" INTEGER NOT NULL,
ALTER COLUMN "ref_id" DROP NOT NULL,
ALTER COLUMN "result" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Nom_printable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "submitted" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Nom_printable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Printable_configuration" (
    "id" SERIAL NOT NULL,
    "id_printable" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Printable_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Results_request_id_investigation_id_ref_id_key" ON "Results"("request_id", "investigation_id", "ref_id");

-- AddForeignKey
ALTER TABLE "Printable_configuration" ADD CONSTRAINT "Printable_configuration_id_printable_fkey" FOREIGN KEY ("id_printable") REFERENCES "Nom_printable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Results" ADD CONSTRAINT "Results_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "Machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Results" ADD CONSTRAINT "Results_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "Refs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
