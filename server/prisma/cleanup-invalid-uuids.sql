-- =====================================================
-- DATA CLEANUP SCRIPT: Remove Invalid UUIDs
-- =====================================================
-- Purpose: Clean up records with invalid UUID values like 'mock-agent-id'
-- Date: November 3, 2025
-- IMPORTANT: Run this before attempting to query ConversationAssignment
-- Run using: psql <database_url> -f cleanup-invalid-uuids.sql
-- OR use a PostgreSQL client like pgAdmin, DBeaver, etc.
-- =====================================================

-- Step 1: Check for invalid UUIDs in conversation_assignments
SELECT
  id,
  conversation_id,
  agent_id,
  admin_id,
  status,
  created_at
FROM "ConversationAssignment"
WHERE
  NOT (agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
  OR NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Step 2: Delete records with invalid agent_id
DELETE FROM "ConversationAssignment"
WHERE NOT (agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Step 3: Delete records with invalid admin_id
DELETE FROM "ConversationAssignment"
WHERE NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Step 4: Verify cleanup
SELECT COUNT(*) as remaining_invalid_records
FROM "ConversationAssignment"
WHERE
  NOT (agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
  OR NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- =====================================================
-- Optional: Update assigned_agent_id in Conversations if needed
-- =====================================================

-- Check for invalid assigned_agent_id in conversations
SELECT
  conversation_id,
  assigned_agent_id,
  escalation_status
FROM "Conversation"
WHERE
  assigned_agent_id IS NOT NULL
  AND NOT (assigned_agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Clean up invalid assigned_agent_id
UPDATE "Conversation"
SET assigned_agent_id = NULL,
    escalation_status = NULL
WHERE
  assigned_agent_id IS NOT NULL
  AND NOT (assigned_agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- =====================================================
-- Summary Report
-- =====================================================
SELECT
  'ConversationAssignment' as table_name,
  COUNT(*) as total_records
FROM "ConversationAssignment"
UNION ALL
SELECT
  'Conversation' as table_name,
  COUNT(*) as total_records
FROM "Conversation";

-- Check for any remaining invalid data
SELECT 'Invalid ConversationAssignment records' as check_name,
       COUNT(*) as count
FROM "ConversationAssignment"
WHERE NOT (agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
   OR NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
UNION ALL
SELECT 'Invalid Conversation.assigned_agent_id' as check_name,
       COUNT(*) as count
FROM "Conversation"
WHERE assigned_agent_id IS NOT NULL
  AND NOT (assigned_agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

