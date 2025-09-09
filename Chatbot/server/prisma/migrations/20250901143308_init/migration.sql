/*
  Warnings:

  - You are about to drop the `chat_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clinic_locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversation_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fpm_interactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_clinic_referrals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_responses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."chat_sessions" DROP CONSTRAINT "chat_sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_analytics" DROP CONSTRAINT "conversation_analytics_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_analytics" DROP CONSTRAINT "conversation_analytics_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."fpm_interactions" DROP CONSTRAINT "fpm_interactions_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."fpm_interactions" DROP CONSTRAINT "fpm_interactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_clinic_referrals" DROP CONSTRAINT "user_clinic_referrals_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_clinic_referrals" DROP CONSTRAINT "user_clinic_referrals_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_clinic_referrals" DROP CONSTRAINT "user_clinic_referrals_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_responses" DROP CONSTRAINT "user_responses_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_responses" DROP CONSTRAINT "user_responses_previous_response_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_responses" DROP CONSTRAINT "user_responses_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_responses" DROP CONSTRAINT "user_responses_user_id_fkey";

-- DropTable
DROP TABLE "public"."chat_sessions";

-- DropTable
DROP TABLE "public"."clinic_locations";

-- DropTable
DROP TABLE "public"."conversation_analytics";

-- DropTable
DROP TABLE "public"."conversations";

-- DropTable
DROP TABLE "public"."fpm_interactions";

-- DropTable
DROP TABLE "public"."user_clinic_referrals";

-- DropTable
DROP TABLE "public"."user_responses";

-- DropTable
DROP TABLE "public"."users";

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL,
    "user_session_id" VARCHAR(255) NOT NULL,
    "selected_language" VARCHAR(20),
    "selected_gender" VARCHAR(30),
    "selected_state" VARCHAR(100),
    "selected_lga" VARCHAR(100),
    "selected_age_group" VARCHAR(20),
    "selected_marital_status" VARCHAR(30),
    "current_step" VARCHAR(50),
    "current_fpm_method" VARCHAR(100),
    "current_concern_type" VARCHAR(100),
    "user_intention" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."ChatSession" (
    "session_id" UUID NOT NULL,
    "user_id" UUID,
    "user_session_id" VARCHAR(255) NOT NULL,
    "session_start_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_end_time" TIMESTAMPTZ(6),
    "total_messages_count" INTEGER NOT NULL DEFAULT 0,
    "session_duration_minutes" INTEGER,
    "session_completed" BOOLEAN NOT NULL DEFAULT false,
    "session_outcome" VARCHAR(100),
    "final_step_reached" VARCHAR(50),
    "user_agent" TEXT,
    "ip_address" INET,
    "device_type" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "conversation_id" UUID NOT NULL,
    "session_id" UUID,
    "user_id" UUID,
    "message_text" TEXT NOT NULL,
    "message_type" VARCHAR(10) NOT NULL,
    "message_source" VARCHAR(20) DEFAULT 'typed',
    "chat_step" VARCHAR(50),
    "widget_name" VARCHAR(100),
    "selected_option" VARCHAR(200),
    "message_delay_ms" INTEGER,
    "has_widget" BOOLEAN NOT NULL DEFAULT false,
    "widget_options" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message_sequence_number" INTEGER NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "public"."UserResponse" (
    "response_id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" UUID,
    "conversation_id" UUID,
    "previous_response_id" UUID,
    "response_category" VARCHAR(50) NOT NULL,
    "response_type" VARCHAR(50) NOT NULL,
    "question_asked" TEXT,
    "user_response" TEXT NOT NULL,
    "response_value" VARCHAR(200),
    "widget_used" VARCHAR(100),
    "available_options" TEXT[],
    "step_in_flow" VARCHAR(50),
    "is_initial_response" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserResponse_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "public"."FpmInteraction" (
    "interaction_id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" UUID,
    "fpm_flow_type" VARCHAR(50),
    "current_fpm_method" VARCHAR(100),
    "interested_fpm_method" VARCHAR(100),
    "fpm_duration_preference" VARCHAR(50),
    "contraception_type" VARCHAR(50),
    "emergency_product" VARCHAR(50),
    "prevention_duration" VARCHAR(50),
    "selected_method" VARCHAR(100),
    "satisfaction_level" VARCHAR(50),
    "switch_reason" VARCHAR(200),
    "stop_reason" VARCHAR(200),
    "important_factors" TEXT[],
    "kids_in_future" VARCHAR(20),
    "timing_preference" VARCHAR(50),
    "menstrual_flow_preference" VARCHAR(100),
    "provided_information" TEXT,
    "next_action" VARCHAR(100),
    "clinic_referral_needed" BOOLEAN NOT NULL DEFAULT false,
    "human_agent_requested" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FpmInteraction_pkey" PRIMARY KEY ("interaction_id")
);

-- CreateTable
CREATE TABLE "public"."ClinicLocation" (
    "clinic_id" UUID NOT NULL,
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

    CONSTRAINT "ClinicLocation_pkey" PRIMARY KEY ("clinic_id")
);

-- CreateTable
CREATE TABLE "public"."UserClinicReferral" (
    "referral_id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" UUID,
    "clinic_id" UUID,
    "referral_reason" VARCHAR(200),
    "user_concern" VARCHAR(200),
    "recommended_service" VARCHAR(100),
    "referral_provided_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_contacted_clinic" BOOLEAN NOT NULL DEFAULT false,
    "user_visited_clinic" BOOLEAN NOT NULL DEFAULT false,
    "visit_confirmed_at" TIMESTAMPTZ(6),
    "follow_up_needed" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_completed" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_notes" TEXT,

    CONSTRAINT "UserClinicReferral_pkey" PRIMARY KEY ("referral_id")
);

-- CreateTable
CREATE TABLE "public"."ConversationAnalytics" (
    "analytics_id" UUID NOT NULL,
    "session_id" UUID,
    "user_id" UUID,
    "steps_completed" TEXT[],
    "widgets_interacted_with" TEXT[],
    "flows_attempted" TEXT[],
    "total_user_messages" INTEGER NOT NULL DEFAULT 0,
    "total_bot_messages" INTEGER NOT NULL DEFAULT 0,
    "total_button_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_typed_responses" INTEGER NOT NULL DEFAULT 0,
    "session_abandonment_point" VARCHAR(50),
    "information_provided" TEXT[],
    "goals_achieved" TEXT[],
    "unresolved_concerns" TEXT[],
    "satisfaction_rating" INTEGER,
    "average_response_time_seconds" DECIMAL(10,2),
    "errors_encountered" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationAnalytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_session_id_key" ON "public"."User"("user_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationAnalytics_session_id_key" ON "public"."ConversationAnalytics"("session_id");

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ChatSession"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserResponse" ADD CONSTRAINT "UserResponse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserResponse" ADD CONSTRAINT "UserResponse_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ChatSession"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserResponse" ADD CONSTRAINT "UserResponse_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."Conversation"("conversation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserResponse" ADD CONSTRAINT "UserResponse_previous_response_id_fkey" FOREIGN KEY ("previous_response_id") REFERENCES "public"."UserResponse"("response_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FpmInteraction" ADD CONSTRAINT "FpmInteraction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FpmInteraction" ADD CONSTRAINT "FpmInteraction_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ChatSession"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserClinicReferral" ADD CONSTRAINT "UserClinicReferral_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserClinicReferral" ADD CONSTRAINT "UserClinicReferral_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ChatSession"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserClinicReferral" ADD CONSTRAINT "UserClinicReferral_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."ClinicLocation"("clinic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationAnalytics" ADD CONSTRAINT "ConversationAnalytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationAnalytics" ADD CONSTRAINT "ConversationAnalytics_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ChatSession"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;
