/*
  Warnings:

  - The primary key for the `chat_sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `chat_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `total_message_count` on the `chat_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `chat_sessions` table. All the data in the column will be lost.
  - You are about to alter the column `user_session_id` on the `chat_sessions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `session_outcome` on the `chat_sessions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `final_step_reached` on the `chat_sessions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The `ip_address` column on the `chat_sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `device_type` on the `chat_sessions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - The primary key for the `conversation_analytics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `average_response_time` on the `conversation_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `conversation_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `total_bot_message` on the `conversation_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `total_user_message` on the `conversation_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `conversation_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `user_session_id` on the `conversation_analytics` table. All the data in the column will be lost.
  - You are about to alter the column `session_abandonment_point` on the `conversation_analytics` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The primary key for the `conversations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chat_session_id` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `user_session_id` on the `conversations` table. All the data in the column will be lost.
  - You are about to alter the column `message_type` on the `conversations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `message_source` on the `conversations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `chat_step` on the `conversations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `widget_name` on the `conversations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `selected_option` on the `conversations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - The primary key for the `fpm_interactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `current_fmp_method` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `erectile_dysfunction_option` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `fmp_duration_preference` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `interested_fmp_method` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `lubricant_selected` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `sex_enhancement_type` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `user_session_id` on the `fpm_interactions` table. All the data in the column will be lost.
  - You are about to alter the column `contraception_type` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `emergency_product` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `prevention_duration` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `selected_method` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `satisfaction_level` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `switch_reason` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `stop_reason` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `kids_in_future` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `timing_preference` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `menstrual_flow_preference` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `next_action` on the `fpm_interactions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `user_clinic_referrals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `user_clinic_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `user_clinic_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user_clinic_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `user_session_id` on the `user_clinic_referrals` table. All the data in the column will be lost.
  - The `clinic_id` column on the `user_clinic_referrals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `referral_reason` on the `user_clinic_referrals` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `user_concern` on the `user_clinic_referrals` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `recommended_service` on the `user_clinic_referrals` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `user_responses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `available_option` on the `user_responses` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `user_responses` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user_responses` table. All the data in the column will be lost.
  - You are about to drop the column `user_session_id` on the `user_responses` table. All the data in the column will be lost.
  - You are about to alter the column `response_category` on the `user_responses` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `response_type` on the `user_responses` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `response_value` on the `user_responses` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `widget_used` on the `user_responses` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `step_in_flow` on the `user_responses` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The `previous_response_id` column on the `user_responses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `user_session_id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `selected_language` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `selected_gender` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `selected_state` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `selected_lga` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `selected_age_group` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `selected_marital_status` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `current_step` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `current_fpm_method` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `current_concern_type` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `user_intention` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- DropForeignKey
ALTER TABLE "public"."chat_sessions" DROP CONSTRAINT "chat_sessions_user_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_analytics" DROP CONSTRAINT "conversation_analytics_user_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_chat_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_user_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."fpm_interactions" DROP CONSTRAINT "fpm_interactions_user_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_clinic_referrals" DROP CONSTRAINT "user_clinic_referrals_user_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_responses" DROP CONSTRAINT "user_responses_user_session_id_fkey";

-- DropIndex
DROP INDEX "public"."conversation_analytics_user_session_id_key";

-- AlterTable
ALTER TABLE "public"."chat_sessions" DROP CONSTRAINT "chat_sessions_pkey",
DROP COLUMN "id",
DROP COLUMN "total_message_count",
DROP COLUMN "updated_at",
ADD COLUMN     "session_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "total_messages_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "user_session_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "session_start_time" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "session_end_time" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "session_completed" SET DEFAULT false,
ALTER COLUMN "session_outcome" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "final_step_reached" SET DATA TYPE VARCHAR(50),
DROP COLUMN "ip_address",
ADD COLUMN     "ip_address" INET,
ALTER COLUMN "device_type" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("session_id");

-- AlterTable
ALTER TABLE "public"."conversation_analytics" DROP CONSTRAINT "conversation_analytics_pkey",
DROP COLUMN "average_response_time",
DROP COLUMN "id",
DROP COLUMN "total_bot_message",
DROP COLUMN "total_user_message",
DROP COLUMN "updated_at",
DROP COLUMN "user_session_id",
ADD COLUMN     "analytics_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "average_response_time_seconds" DECIMAL(10,2),
ADD COLUMN     "session_id" UUID,
ADD COLUMN     "total_bot_messages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_user_messages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "total_button_clicks" SET DEFAULT 0,
ALTER COLUMN "total_typed_responses" SET DEFAULT 0,
ALTER COLUMN "session_abandonment_point" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "conversation_analytics_pkey" PRIMARY KEY ("analytics_id");

-- AlterTable
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_pkey",
DROP COLUMN "chat_session_id",
DROP COLUMN "id",
DROP COLUMN "updated_at",
DROP COLUMN "user_session_id",
ADD COLUMN     "conversation_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "session_id" UUID,
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "message_type" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "message_source" DROP NOT NULL,
ALTER COLUMN "message_source" SET DEFAULT 'typed',
ALTER COLUMN "message_source" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "chat_step" DROP NOT NULL,
ALTER COLUMN "chat_step" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "widget_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "selected_option" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "has_widget" SET DEFAULT false,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("conversation_id");

-- AlterTable
ALTER TABLE "public"."fpm_interactions" DROP CONSTRAINT "fpm_interactions_pkey",
DROP COLUMN "current_fmp_method",
DROP COLUMN "erectile_dysfunction_option",
DROP COLUMN "fmp_duration_preference",
DROP COLUMN "id",
DROP COLUMN "interested_fmp_method",
DROP COLUMN "lubricant_selected",
DROP COLUMN "sex_enhancement_type",
DROP COLUMN "updated_at",
DROP COLUMN "user_session_id",
ADD COLUMN     "current_fpm_method" VARCHAR(100),
ADD COLUMN     "fpm_duration_preference" VARCHAR(50),
ADD COLUMN     "fpm_flow_type" VARCHAR(50),
ADD COLUMN     "interaction_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "interested_fpm_method" VARCHAR(100),
ADD COLUMN     "session_id" UUID,
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "contraception_type" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "emergency_product" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "prevention_duration" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "selected_method" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "satisfaction_level" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "switch_reason" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "stop_reason" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "kids_in_future" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "timing_preference" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "menstrual_flow_preference" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "next_action" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "fpm_interactions_pkey" PRIMARY KEY ("interaction_id");

-- AlterTable
ALTER TABLE "public"."user_clinic_referrals" DROP CONSTRAINT "user_clinic_referrals_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "updated_at",
DROP COLUMN "user_session_id",
ADD COLUMN     "follow_up_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "follow_up_notes" TEXT,
ADD COLUMN     "referral_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "referral_provided_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "session_id" UUID,
ADD COLUMN     "user_contacted_clinic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" UUID,
ADD COLUMN     "user_visited_clinic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visit_confirmed_at" TIMESTAMPTZ(6),
DROP COLUMN "clinic_id",
ADD COLUMN     "clinic_id" UUID,
ALTER COLUMN "referral_reason" DROP NOT NULL,
ALTER COLUMN "referral_reason" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "user_concern" DROP NOT NULL,
ALTER COLUMN "user_concern" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "recommended_service" DROP NOT NULL,
ALTER COLUMN "recommended_service" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "follow_up_needed" SET DEFAULT false,
ADD CONSTRAINT "user_clinic_referrals_pkey" PRIMARY KEY ("referral_id");

-- AlterTable
ALTER TABLE "public"."user_responses" DROP CONSTRAINT "user_responses_pkey",
DROP COLUMN "available_option",
DROP COLUMN "id",
DROP COLUMN "updated_at",
DROP COLUMN "user_session_id",
ADD COLUMN     "available_options" TEXT[],
ADD COLUMN     "conversation_id" UUID,
ADD COLUMN     "response_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "session_id" UUID,
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "response_category" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "response_type" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "question_asked" DROP NOT NULL,
ALTER COLUMN "response_value" DROP NOT NULL,
ALTER COLUMN "response_value" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "widget_used" DROP NOT NULL,
ALTER COLUMN "widget_used" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "step_in_flow" DROP NOT NULL,
ALTER COLUMN "step_in_flow" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "is_initial_response" SET DEFAULT true,
DROP COLUMN "previous_response_id",
ADD COLUMN     "previous_response_id" UUID,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "user_responses_pkey" PRIMARY KEY ("response_id");

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "last_active_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "user_session_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "selected_language" DROP NOT NULL,
ALTER COLUMN "selected_language" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "selected_gender" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "selected_state" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "selected_lga" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "selected_age_group" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "selected_marital_status" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "current_step" DROP NOT NULL,
ALTER COLUMN "current_step" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "current_fpm_method" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "current_concern_type" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "user_intention" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

-- CreateTable
CREATE TABLE "public"."clinic_locations" (
    "clinic_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clinic_name" VARCHAR(200) NOT NULL,
    "clinic_type" VARCHAR(50),
    "state" VARCHAR(100) NOT NULL,
    "lga" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100),
    "address" TEXT,
    "landmark" VARCHAR(200),
    "phone_number" VARCHAR(20),
    "email" VARCHAR(100),
    "website" VARCHAR(200),
    "services_offered" TEXT[],
    "fpm_methods_available" TEXT[],
    "consultation_fee" DECIMAL(10,2),
    "operating_hours" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_locations_pkey" PRIMARY KEY ("clinic_id")
);

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_responses" ADD CONSTRAINT "user_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_responses" ADD CONSTRAINT "user_responses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_responses" ADD CONSTRAINT "user_responses_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_responses" ADD CONSTRAINT "user_responses_previous_response_id_fkey" FOREIGN KEY ("previous_response_id") REFERENCES "public"."user_responses"("response_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fpm_interactions" ADD CONSTRAINT "fpm_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fpm_interactions" ADD CONSTRAINT "fpm_interactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_clinic_referrals" ADD CONSTRAINT "user_clinic_referrals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_clinic_referrals" ADD CONSTRAINT "user_clinic_referrals_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_clinic_referrals" ADD CONSTRAINT "user_clinic_referrals_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic_locations"("clinic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_analytics" ADD CONSTRAINT "conversation_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_analytics" ADD CONSTRAINT "conversation_analytics_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;
