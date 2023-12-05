-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_projectId_fkey";

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
