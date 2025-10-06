-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "user_session_id" TEXT NOT NULL,
    "selected_language" TEXT NOT NULL,
    "selected_gender" TEXT,
    "selected_state" TEXT,
    "selected_lga" TEXT,
    "selected_age_group" TEXT,
    "selected_marital_status" TEXT,
    "current_step" TEXT NOT NULL,
    "current_fpm_method" TEXT,
    "current_concern_type" TEXT,
    "user_intention" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_sessions" (
    "id" TEXT NOT NULL,
    "user_session_id" TEXT NOT NULL,
    "session_start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_end_time" TIMESTAMP(3),
    "total_message_count" INTEGER NOT NULL,
    "session_duration_minutes" INTEGER,
    "session_completed" BOOLEAN NOT NULL,
    "session_outcome" TEXT,
    "final_step_reached" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "device_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "user_session_id" TEXT NOT NULL,
    "chat_session_id" TEXT NOT NULL,
    "message_text" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "message_source" TEXT NOT NULL,
    "chat_step" TEXT NOT NULL,
    "widget_name" TEXT,
    "selected_option" TEXT,
    "message_delay_ms" INTEGER,
    "has_widget" BOOLEAN NOT NULL,
    "widget_options" TEXT[],
    "message_sequence_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_responses" (
    "id" TEXT NOT NULL,
    "user_session_id" TEXT NOT NULL,
    "response_category" TEXT NOT NULL,
    "response_type" TEXT NOT NULL,
    "question_asked" TEXT NOT NULL,
    "user_response" TEXT NOT NULL,
    "response_value" TEXT NOT NULL,
    "widget_used" TEXT NOT NULL,
    "available_option" TEXT[],
    "step_in_flow" TEXT NOT NULL,
    "is_initial_response" BOOLEAN NOT NULL,
    "previous_response_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fpm_interactions" (
    "id" TEXT NOT NULL,
    "user_session_id" TEXT NOT NULL,
    "current_fmp_method" TEXT,
    "interested_fmp_method" TEXT,
    "fmp_duration_preference" TEXT,
    "contraception_type" TEXT,
    "emergency_product" TEXT,
    "prevention_duration" TEXT,
    "selected_method" TEXT,
    "satisfaction_level" TEXT,
    "switch_reason" TEXT,
    "stop_reason" TEXT,
    "important_factors" TEXT[],
    "kids_in_future" TEXT,
    "timing_preference" TEXT,
    "menstrual_flow_preference" TEXT,
    "sex_enhancement_type" TEXT,
    "erectile_dysfunction_option" TEXT,
    "lubricant_selected" TEXT,
    "provided_information" TEXT,
    "next_action" TEXT,
    "clinic_referral_needed" BOOLEAN NOT NULL DEFAULT false,
    "human_agent_requested" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fpm_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_clinic_referrals" (
    "id" TEXT NOT NULL,
    "user_session_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "referral_reason" TEXT NOT NULL,
    "user_concern" TEXT NOT NULL,
    "recommended_service" TEXT NOT NULL,
    "follow_up_needed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_clinic_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_analytics" (
    "id" TEXT NOT NULL,
    "user_session_id" TEXT NOT NULL,
    "steps_completed" TEXT[],
    "widgets_interacted_with" TEXT[],
    "flows_attempted" TEXT[],
    "total_user_message" INTEGER NOT NULL,
    "total_bot_message" INTEGER NOT NULL,
    "total_button_clicks" INTEGER NOT NULL,
    "total_typed_responses" INTEGER NOT NULL,
    "session_abandonment_point" TEXT,
    "information_provided" TEXT[],
    "goals_achieved" TEXT[],
    "unresolved_concerns" TEXT[],
    "satisfaction_rating" INTEGER,
    "average_response_time" INTEGER,
    "errors_encountered" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_session_id_key" ON "public"."users"("user_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_analytics_user_session_id_key" ON "public"."conversation_analytics"("user_session_id");

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_user_session_id_fkey" FOREIGN KEY ("user_session_id") REFERENCES "public"."users"("user_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_user_session_id_fkey" FOREIGN KEY ("user_session_id") REFERENCES "public"."users"("user_session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_chat_session_id_fkey" FOREIGN KEY ("chat_session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_responses" ADD CONSTRAINT "user_responses_user_session_id_fkey" FOREIGN KEY ("user_session_id") REFERENCES "public"."users"("user_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fpm_interactions" ADD CONSTRAINT "fpm_interactions_user_session_id_fkey" FOREIGN KEY ("user_session_id") REFERENCES "public"."users"("user_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_clinic_referrals" ADD CONSTRAINT "user_clinic_referrals_user_session_id_fkey" FOREIGN KEY ("user_session_id") REFERENCES "public"."users"("user_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_analytics" ADD CONSTRAINT "conversation_analytics_user_session_id_fkey" FOREIGN KEY ("user_session_id") REFERENCES "public"."users"("user_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;
