-- Migration: Add chat_state_sessions table
-- Created: 2025-10-02
-- Purpose: Store chat state for session persistence across devices

CREATE TABLE IF NOT EXISTS chat_state_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_session_id VARCHAR(255) UNIQUE NOT NULL,
    chat_state TEXT NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_state_sessions_user_session_id ON chat_state_sessions(user_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_state_sessions_last_activity ON chat_state_sessions(last_activity);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_chat_state_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_state_sessions_updated_at_trigger
    BEFORE UPDATE ON chat_state_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_state_sessions_updated_at();
