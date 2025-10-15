-- AlterTable
ALTER TABLE "public"."FpmInteraction" ADD COLUMN     "contraception_choice" VARCHAR(100),
ADD COLUMN     "emergency_prevention_choice" VARCHAR(100),
ADD COLUMN     "improve_intimacy_choice" VARCHAR(100),
ADD COLUMN     "other_method_choices" VARCHAR(100),
ADD COLUMN     "prevention_choice" VARCHAR(100),
ADD COLUMN     "side_effects" VARCHAR(100),
ADD COLUMN     "switch_method" VARCHAR(100);
