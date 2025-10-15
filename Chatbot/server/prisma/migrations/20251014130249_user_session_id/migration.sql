/*
  Warnings:

  - A unique constraint covering the columns `[user_session_id]` on the table `FpmInteraction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."FpmInteraction" ADD COLUMN     "gel_lubricant_choice" VARCHAR(100),
ADD COLUMN     "user_session_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "FpmInteraction_user_session_id_key" ON "public"."FpmInteraction"("user_session_id");
