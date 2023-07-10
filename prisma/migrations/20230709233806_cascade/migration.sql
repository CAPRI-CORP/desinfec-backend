-- DropForeignKey
ALTER TABLE "scheduled_services" DROP CONSTRAINT "scheduled_services_schedulingId_fkey";

-- AddForeignKey
ALTER TABLE "scheduled_services" ADD CONSTRAINT "scheduled_services_schedulingId_fkey" FOREIGN KEY ("schedulingId") REFERENCES "schedulings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
