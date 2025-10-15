-- AlterTable
ALTER TABLE "public"."FpmInteraction" ADD COLUMN     "dailypills_stop_period" VARCHAR(100),
ADD COLUMN     "implant_removal_duration" VARCHAR(100),
ADD COLUMN     "injection_stop_period" VARCHAR(100),
ADD COLUMN     "iud_removal_duration" VARCHAR(100),
ADD COLUMN     "pregnancy_trial" VARCHAR(100);
