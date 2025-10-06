-- =====================================================================
-- CHATBOT POSTGRESQL DATABASE SCHEMA
-- =====================================================================

-- =====================================================================
-- 1. USERS TABLE - Store user profile and preferences
-- =====================================================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_session_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- User Demographics (from onboarding flow)
    selected_language VARCHAR(20), -- 'English', 'Hausa', 'Yoruba'
    selected_gender VARCHAR(30), -- 'Male 👨', 'Female 👩', 'Prefer not to say'
    selected_state VARCHAR(100), -- Nigerian state name
    selected_lga VARCHAR(100), -- Local Government Area
    selected_age_group VARCHAR(20), -- '< 25', '26-35', '36-45', '46-55', '55 and older'
    selected_marital_status VARCHAR(30), -- 'Single', 'In a relationship', 'Married', 'Prefer not to say'
    
    -- Current session state
    current_step VARCHAR(50), -- Current chatbot step/flow
    current_fpm_method VARCHAR(100), -- Current family planning method if any
    current_concern_type VARCHAR(100), -- Current concern being discussed
    user_intention VARCHAR(100), -- What user wants to achieve
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 2. CHAT_SESSIONS TABLE - Track individual chat sessions
-- =====================================================================
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    user_session_id VARCHAR(255) NOT NULL,
    
    -- Session metadata
    session_start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_end_time TIMESTAMP WITH TIME ZONE,
    total_messages_count INTEGER DEFAULT 0,
    session_duration_minutes INTEGER,
    
    -- Session outcome
    session_completed BOOLEAN DEFAULT FALSE,
    session_outcome VARCHAR(100), -- 'completed', 'abandoned', 'transferred_to_human', 'clinic_referral'
    final_step_reached VARCHAR(50),
    
    -- Device/Browser info (optional)
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 3. CONVERSATIONS TABLE - Store all messages and interactions
-- =====================================================================
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(session_id),
    user_id UUID REFERENCES users(user_id),
    
    -- Message details
    message_text TEXT NOT NULL,
    message_type VARCHAR(10) NOT NULL, -- 'user', 'bot'
    message_source VARCHAR(20) DEFAULT 'typed', -- 'typed', 'button_click', 'widget_selection'
    
    -- Context information
    chat_step VARCHAR(50), -- Step when message was sent
    widget_name VARCHAR(100), -- Widget that was displayed (if any)
    selected_option VARCHAR(200), -- Option selected from widget (if button click)
    
    -- Message metadata
    message_delay_ms INTEGER, -- Delay before bot message (if bot)
    has_widget BOOLEAN DEFAULT FALSE,
    widget_options TEXT[], -- Array of options shown to user
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Message order in conversation
    message_sequence_number INTEGER NOT NULL
);

-- =====================================================================
-- 4. USER_RESPONSES TABLE - Track specific user choices/responses
-- =====================================================================
CREATE TABLE user_responses (
    response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    session_id UUID REFERENCES chat_sessions(session_id),
    conversation_id UUID REFERENCES conversations(conversation_id),
    
    -- Response categorization
    response_category VARCHAR(50) NOT NULL, -- 'demographic', 'fpm_selection', 'concern', 'preference', etc.
    response_type VARCHAR(50) NOT NULL, -- 'language_selection', 'gender_selection', 'age_selection', etc.
    
    -- Response data
    question_asked TEXT, -- The question/prompt that led to this response
    user_response TEXT NOT NULL, -- What the user selected/typed
    response_value VARCHAR(200), -- Normalized value for analysis
    
    -- Context
    widget_used VARCHAR(100), -- Widget that captured this response
    available_options TEXT[], -- All options that were available
    step_in_flow VARCHAR(50), -- Which step in the chatbot flow
    
    -- Response metadata
    is_initial_response BOOLEAN DEFAULT TRUE, -- First time answering this question
    previous_response_id UUID REFERENCES user_responses(response_id), -- If this updates a previous response
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 5. FPM_INTERACTIONS TABLE - Track Family Planning Method interactions
-- =====================================================================
CREATE TABLE fpm_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    session_id UUID REFERENCES chat_sessions(session_id),
    
    -- FPM Flow Type
    fpm_flow_type VARCHAR(50), -- 'prevent_pregnancy', 'get_pregnant', 'change_fpm', 'stop_fpm', 'fpm_concerns'
    
    -- FPM Method Information
    current_fpm_method VARCHAR(100), -- User's current method (if any)
    interested_fpm_method VARCHAR(100), -- Method user is asking about
    fpm_duration_preference VARCHAR(50), -- How long they want protection
    
    -- Specific Selections
    contraception_type VARCHAR(50), -- 'Emergency', 'Prevent in future'
    emergency_product VARCHAR(50), -- 'Postpill', 'Postinor-2'
    prevention_duration VARCHAR(50), -- 'Up to 1 year', '1-2 years', etc.
    selected_method VARCHAR(100), -- Final method selected
    
    -- User Preferences & Concerns
    satisfaction_level VARCHAR(50), -- Current method satisfaction
    switch_reason VARCHAR(200), -- Why switching methods
    stop_reason VARCHAR(200), -- Why stopping method
    important_factors TEXT[], -- What's important to user
    kids_in_future VARCHAR(20), -- 'Yes', 'No'
    timing_preference VARCHAR(50), -- When they want kids
    menstrual_flow_preference VARCHAR(100), -- Menstrual preferences
    
    -- Interaction outcome
    provided_information TEXT, -- Information given to user
    next_action VARCHAR(100), -- Recommended next step
    clinic_referral_needed BOOLEAN DEFAULT FALSE,
    human_agent_requested BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 6. CLINIC_LOCATIONS TABLE - Store clinic information for referrals
-- =====================================================================
CREATE TABLE clinic_locations (
    clinic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic clinic information
    clinic_name VARCHAR(200) NOT NULL,
    clinic_type VARCHAR(50), -- 'government', 'private', 'ngo', 'hospital'
    
    -- Location details
    state VARCHAR(100) NOT NULL,
    lga VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    landmark VARCHAR(200),
    
    -- Contact information
    phone_number VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    
    -- Services offered
    services_offered TEXT[], -- Array of services
    fpm_methods_available TEXT[], -- Available FPM methods
    consultation_fee DECIMAL(10,2),
    operating_hours TEXT,
    
    -- Geolocation (optional)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Clinic status
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 7. USER_CLINIC_REFERRALS TABLE - Track clinic referrals
-- =====================================================================
CREATE TABLE user_clinic_referrals (
    referral_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    session_id UUID REFERENCES chat_sessions(session_id),
    clinic_id UUID REFERENCES clinic_locations(clinic_id),
    
    -- Referral details
    referral_reason VARCHAR(200), -- Why referred to clinic
    user_concern VARCHAR(200), -- Specific concern that led to referral
    recommended_service VARCHAR(100), -- What service recommended
    
    -- Referral status
    referral_provided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_contacted_clinic BOOLEAN DEFAULT FALSE,
    user_visited_clinic BOOLEAN DEFAULT FALSE,
    visit_confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Follow-up
    follow_up_needed BOOLEAN DEFAULT FALSE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT
);

-- =====================================================================
-- 8. CONVERSATION_ANALYTICS TABLE - Track conversation patterns
-- =====================================================================
CREATE TABLE conversation_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(session_id),
    user_id UUID REFERENCES users(user_id),
    
    -- Flow completion tracking
    steps_completed TEXT[], -- Array of steps user completed
    widgets_interacted_with TEXT[], -- Widgets user used
    flows_attempted TEXT[], -- Different flows user tried
    
    -- Engagement metrics
    total_user_messages INTEGER DEFAULT 0,
    total_bot_messages INTEGER DEFAULT 0,
    total_button_clicks INTEGER DEFAULT 0,
    total_typed_responses INTEGER DEFAULT 0,
    session_abandonment_point VARCHAR(50), -- Where user left
    
    -- Outcome tracking
    information_provided TEXT[], -- Topics covered
    goals_achieved TEXT[], -- What user accomplished
    unresolved_concerns TEXT[], -- What wasn't addressed
    satisfaction_rating INTEGER, -- 1-5 rating if collected
    
    -- Technical metrics
    average_response_time_seconds DECIMAL(10,2),
    errors_encountered TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Users table indexes
CREATE INDEX idx_users_session_id ON users(user_session_id);
CREATE INDEX idx_users_state_lga ON users(selected_state, selected_lga);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Chat sessions indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_start_time ON chat_sessions(session_start_time);

-- Conversations indexes
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_sequence ON conversations(session_id, message_sequence_number);

-- User responses indexes
CREATE INDEX idx_user_responses_user_id ON user_responses(user_id);
CREATE INDEX idx_user_responses_category ON user_responses(response_category);
CREATE INDEX idx_user_responses_type ON user_responses(response_type);

-- FPM interactions indexes
CREATE INDEX idx_fmp_interactions_user_id ON fmp_interactions(user_id);
CREATE INDEX idx_fmp_interactions_flow_type ON fmp_interactions(fmp_flow_type);

-- Clinic locations indexes
CREATE INDEX idx_clinic_locations_state_lga ON clinic_locations(state, lga);
CREATE INDEX idx_clinic_locations_active ON clinic_locations(is_active);

-- Referrals indexes
CREATE INDEX idx_referrals_user_id ON user_clinic_referrals(user_id);
CREATE INDEX idx_referrals_clinic_id ON user_clinic_referrals(clinic_id);