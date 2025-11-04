-- DATA CLEANUP SCRIPTS
-- Purpose: Fix NULL foreign keys before enforcing NOT NULL constraints
-- ⚠️ IMPORTANT: Run DATABASE_AUDIT.sql FIRST to understand the scope
-- ⚠️ BACKUP your database before running these scripts!

-- ============================================================================
-- PREPARATION
-- ============================================================================

-- 1. Create backup tables
CREATE TABLE IF NOT EXISTS backup_conversations AS SELECT * FROM conversations;
CREATE TABLE IF NOT EXISTS backup_user_responses AS SELECT * FROM user_responses;
CREATE TABLE IF NOT EXISTS backup_fpm_interactions AS SELECT * FROM fpm_interactions;
CREATE TABLE IF NOT EXISTS backup_user_clinic_referrals AS SELECT * FROM user_clinic_referrals;

SELECT 'Backup tables created successfully' as status;

-- ============================================================================
-- SECTION 1: FIX CONVERSATIONS TABLE
-- ============================================================================

-- Strategy:
-- 1. If conversation has user_id but no session_id → Find user's most recent session
-- 2. If conversation has session_id but no user_id → Get user from session
-- 3. If conversation has NEITHER → Try to find from user_session_id in related tables
-- 4. If still can't fix → DELETE (orphaned data)

-- 1.1: Fix conversations with user_id but missing session_id
UPDATE conversations c
SET session_id = (
  SELECT cs.session_id
  FROM chat_sessions cs
  WHERE cs.user_id = c.user_id
  ORDER BY cs.created_at DESC
  LIMIT 1
)
WHERE c.session_id IS NULL 
  AND c.user_id IS NOT NULL;

SELECT 'Fixed conversations: Added session_id where user_id exists' as status,
  COUNT(*) as fixed_count
FROM conversations
WHERE session_id IS NOT NULL 
  AND user_id IS NOT NULL;

-- 1.2: Fix conversations with session_id but missing user_id
UPDATE conversations c
SET user_id = (
  SELECT cs.user_id
  FROM chat_sessions cs
  WHERE cs.session_id = c.session_id
  LIMIT 1
)
WHERE c.user_id IS NULL 
  AND c.session_id IS NOT NULL;

SELECT 'Fixed conversations: Added user_id where session_id exists' as status;

-- 1.3: Try to salvage orphaned conversations by finding user from message patterns
-- (This attempts to link conversations based on similar message timing and content)
WITH orphaned_conversations AS (
  SELECT 
    c.conversation_id,
    c.created_at,
    c.message_text
  FROM conversations c
  WHERE c.session_id IS NULL AND c.user_id IS NULL
),
potential_sessions AS (
  SELECT DISTINCT
    oc.conversation_id,
    cs.session_id,
    cs.user_id,
    ROW_NUMBER() OVER (
      PARTITION BY oc.conversation_id 
      ORDER BY ABS(EXTRACT(EPOCH FROM (cs.created_at - oc.created_at)))
    ) as rn
  FROM orphaned_conversations oc
  CROSS JOIN chat_sessions cs
  WHERE cs.created_at BETWEEN oc.created_at - INTERVAL '5 minutes' 
    AND oc.created_at + INTERVAL '5 minutes'
)
UPDATE conversations c
SET 
  session_id = ps.session_id,
  user_id = ps.user_id
FROM potential_sessions ps
WHERE c.conversation_id = ps.conversation_id
  AND ps.rn = 1
  AND c.session_id IS NULL
  AND c.user_id IS NULL;

SELECT 'Attempted to salvage orphaned conversations by time proximity' as status;

-- 1.4: DELETE truly orphaned conversations (after backup)
-- ⚠️ Only run after reviewing backup_conversations table
DELETE FROM conversations
WHERE session_id IS NULL AND user_id IS NULL;

SELECT 'Deleted orphaned conversations that could not be fixed' as status,
  COUNT(*) as deleted_count
FROM backup_conversations
WHERE session_id IS NULL AND user_id IS NULL;

-- ============================================================================
-- SECTION 2: FIX USER_RESPONSES TABLE
-- ============================================================================

-- 2.1: Fix responses with conversation_id → get user_id and session_id from conversation
UPDATE user_responses ur
SET 
  user_id = c.user_id,
  session_id = c.session_id
FROM conversations c
WHERE ur.conversation_id = c.conversation_id
  AND (ur.user_id IS NULL OR ur.session_id IS NULL)
  AND c.user_id IS NOT NULL
  AND c.session_id IS NOT NULL;

SELECT 'Fixed user_responses: Added user_id and session_id from conversation' as status;

-- 2.2: Fix responses with user_id and session_id but missing conversation_id
-- Find the most recent conversation in that session with matching timestamp
UPDATE user_responses ur
SET conversation_id = (
  SELECT c.conversation_id
  FROM conversations c
  WHERE c.user_id = ur.user_id
    AND c.session_id = ur.session_id
    AND c.created_at <= ur.created_at
    AND c.message_type = 'bot' -- Response likely follows a bot message
  ORDER BY c.created_at DESC
  LIMIT 1
)
WHERE ur.conversation_id IS NULL
  AND ur.user_id IS NOT NULL
  AND ur.session_id IS NOT NULL;

SELECT 'Fixed user_responses: Added conversation_id where possible' as status;

-- 2.3: Try to link by user_session_id (stored in user table)
UPDATE user_responses ur
SET 
  user_id = u.user_id,
  session_id = cs.session_id
FROM users u
INNER JOIN chat_sessions cs ON u.user_id = cs.user_id
WHERE ur.user_id IS NULL
  AND u.user_session_id = (
    SELECT user_session_id 
    FROM fpm_interactions fi 
    WHERE fi.created_at BETWEEN ur.created_at - INTERVAL '1 minute' 
      AND ur.created_at + INTERVAL '1 minute'
    LIMIT 1
  );

SELECT 'Fixed user_responses: Linked via user_session_id correlation' as status;

-- 2.4: DELETE orphaned responses that can't be fixed
DELETE FROM user_responses
WHERE (user_id IS NULL OR session_id IS NULL OR conversation_id IS NULL);

SELECT 'Deleted orphaned user_responses' as status,
  COUNT(*) as deleted_count
FROM backup_user_responses
WHERE (user_id IS NULL OR session_id IS NULL OR conversation_id IS NULL);

-- ============================================================================
-- SECTION 3: FIX FPM_INTERACTIONS TABLE
-- ============================================================================

-- 3.1: Fix FPM interactions using user_session_id
UPDATE fpm_interactions fi
SET 
  user_id = u.user_id,
  session_id = cs.session_id
FROM users u
INNER JOIN chat_sessions cs ON u.user_id = cs.user_id
WHERE (fi.user_id IS NULL OR fi.session_id IS NULL)
  AND fi.user_session_id = u.user_session_id
  AND cs.created_at <= fi.created_at
ORDER BY cs.created_at DESC;

SELECT 'Fixed fpm_interactions: Linked via user_session_id' as status;

-- 3.2: Fix by finding nearest session in time
UPDATE fpm_interactions fi
SET 
  user_id = cs.user_id,
  session_id = cs.session_id
FROM chat_sessions cs
WHERE (fi.user_id IS NULL OR fi.session_id IS NULL)
  AND cs.session_id = (
    SELECT session_id
    FROM chat_sessions
    WHERE created_at BETWEEN fi.created_at - INTERVAL '10 minutes' 
      AND fi.created_at + INTERVAL '10 minutes'
    ORDER BY ABS(EXTRACT(EPOCH FROM (created_at - fi.created_at)))
    LIMIT 1
  );

SELECT 'Fixed fpm_interactions: Linked by time proximity' as status;

-- 3.3: DELETE orphaned FPM interactions
DELETE FROM fpm_interactions
WHERE user_id IS NULL OR session_id IS NULL;

SELECT 'Deleted orphaned fpm_interactions' as status,
  COUNT(*) as deleted_count
FROM backup_fpm_interactions
WHERE user_id IS NULL OR session_id IS NULL;

-- ============================================================================
-- SECTION 4: FIX USER_CLINIC_REFERRALS TABLE
-- ============================================================================

-- 4.1: Fix referrals with user_id but missing session_id
UPDATE user_clinic_referrals ucr
SET session_id = (
  SELECT cs.session_id
  FROM chat_sessions cs
  WHERE cs.user_id = ucr.user_id
  ORDER BY cs.created_at DESC
  LIMIT 1
)
WHERE ucr.session_id IS NULL 
  AND ucr.user_id IS NOT NULL;

SELECT 'Fixed user_clinic_referrals: Added session_id' as status;

-- 4.2: Fix referrals with session_id but missing user_id
UPDATE user_clinic_referrals ucr
SET user_id = (
  SELECT cs.user_id
  FROM chat_sessions cs
  WHERE cs.session_id = ucr.session_id
  LIMIT 1
)
WHERE ucr.user_id IS NULL 
  AND ucr.session_id IS NOT NULL;

SELECT 'Fixed user_clinic_referrals: Added user_id' as status;

-- 4.3: Fix referrals missing clinic_id by finding nearest clinic
-- (This is risky - only run if you have logic to determine correct clinic)
-- Commented out for safety:
/*
UPDATE user_clinic_referrals ucr
SET clinic_id = (
  SELECT clinic_id
  FROM clinic_locations
  WHERE state = (SELECT state FROM users WHERE user_id = ucr.user_id)
  ORDER BY city
  LIMIT 1
)
WHERE ucr.clinic_id IS NULL
  AND ucr.user_id IS NOT NULL;
*/

-- 4.4: DELETE referrals that can't be fixed
-- ⚠️ Referrals without clinic_id are INVALID and should be deleted
DELETE FROM user_clinic_referrals
WHERE user_id IS NULL 
   OR session_id IS NULL 
   OR clinic_id IS NULL;

SELECT 'Deleted invalid user_clinic_referrals' as status,
  COUNT(*) as deleted_count
FROM backup_user_clinic_referrals
WHERE user_id IS NULL OR session_id IS NULL OR clinic_id IS NULL;

-- ============================================================================
-- SECTION 5: FIX CONVERSATION_ANALYTICS TABLE
-- ============================================================================

-- 5.1: Fix analytics with user_session_id but no user_id
UPDATE conversation_analytics ca
SET user_id = (
  SELECT u.user_id
  FROM users u
  WHERE u.user_session_id = ca.user_session_id
  LIMIT 1
)
WHERE ca.user_id IS NULL
  AND ca.user_session_id IS NOT NULL;

SELECT 'Fixed conversation_analytics: Added user_id via user_session_id' as status;

-- 5.2: DELETE analytics without user_id (can't attribute to anyone)
DELETE FROM conversation_analytics
WHERE user_id IS NULL;

SELECT 'Deleted anonymous analytics' as status;

-- ============================================================================
-- SECTION 6: FIX AGENT SYSTEM TABLES
-- ============================================================================

-- 6.1: Remove conversation assignments for non-existent conversations
DELETE FROM conversation_assignments
WHERE conversation_id NOT IN (SELECT conversation_id FROM conversations);

SELECT 'Cleaned conversation_assignments' as status;

-- 6.2: Remove queue entries for non-existent conversations
DELETE FROM conversation_queue
WHERE conversation_id NOT IN (SELECT conversation_id FROM conversations);

SELECT 'Cleaned conversation_queue' as status;

-- 6.3: Remove agent messages for non-existent conversations
DELETE FROM agent_messages
WHERE conversation_id NOT IN (SELECT conversation_id FROM conversations);

SELECT 'Cleaned agent_messages' as status;

-- ============================================================================
-- SECTION 7: FIX CHANNEL SYSTEM TABLES
-- ============================================================================

-- 7.1: Set default channel for conversations without channel_id
-- Assuming 'web' is the default channel
UPDATE conversations c
SET channel_id = (
  SELECT id FROM channels WHERE type = 'WEB' LIMIT 1
)
WHERE c.channel_id IS NULL;

SELECT 'Set default channel for conversations' as status;

-- 7.2: Remove channel messages for non-existent conversations
DELETE FROM channel_messages
WHERE conversation_id NOT IN (SELECT conversation_id FROM conversations);

SELECT 'Cleaned channel_messages' as status;

-- ============================================================================
-- SECTION 8: VERIFICATION
-- ============================================================================

-- 8.1: Count remaining NULL foreign keys (should be 0)
SELECT 
  'POST-CLEANUP VERIFICATION' as section,
  (SELECT COUNT(*) FROM conversations WHERE session_id IS NULL OR user_id IS NULL) as null_conversations,
  (SELECT COUNT(*) FROM user_responses WHERE user_id IS NULL OR session_id IS NULL OR conversation_id IS NULL) as null_responses,
  (SELECT COUNT(*) FROM fpm_interactions WHERE user_id IS NULL OR session_id IS NULL) as null_fpm,
  (SELECT COUNT(*) FROM user_clinic_referrals WHERE user_id IS NULL OR session_id IS NULL OR clinic_id IS NULL) as null_referrals,
  (SELECT COUNT(*) FROM conversation_analytics WHERE user_id IS NULL) as null_analytics;

-- 8.2: Compare record counts before and after
SELECT 
  'RECORD COUNT COMPARISON' as section,
  (SELECT COUNT(*) FROM backup_conversations) as conversations_before,
  (SELECT COUNT(*) FROM conversations) as conversations_after,
  (SELECT COUNT(*) FROM backup_user_responses) as responses_before,
  (SELECT COUNT(*) FROM user_responses) as responses_after,
  (SELECT COUNT(*) FROM backup_fpm_interactions) as fpm_before,
  (SELECT COUNT(*) FROM fpm_interactions) as fpm_after,
  (SELECT COUNT(*) FROM backup_user_clinic_referrals) as referrals_before,
  (SELECT COUNT(*) FROM user_clinic_referrals) as referrals_after;

-- 8.3: Data loss summary
SELECT 
  'DATA LOSS SUMMARY' as section,
  (SELECT COUNT(*) FROM backup_conversations) - (SELECT COUNT(*) FROM conversations) as conversations_deleted,
  (SELECT COUNT(*) FROM backup_user_responses) - (SELECT COUNT(*) FROM user_responses) as responses_deleted,
  (SELECT COUNT(*) FROM backup_fpm_interactions) - (SELECT COUNT(*) FROM fpm_interactions) as fpm_deleted,
  (SELECT COUNT(*) FROM backup_user_clinic_referrals) - (SELECT COUNT(*) FROM user_clinic_referrals) as referrals_deleted;

-- ============================================================================
-- SECTION 9: ROLLBACK (IF NEEDED)
-- ============================================================================

-- ⚠️ Only run these if cleanup failed or caused issues

-- Rollback conversations
-- TRUNCATE conversations;
-- INSERT INTO conversations SELECT * FROM backup_conversations;

-- Rollback user_responses
-- TRUNCATE user_responses;
-- INSERT INTO user_responses SELECT * FROM backup_user_responses;

-- Rollback fpm_interactions
-- TRUNCATE fpm_interactions;
-- INSERT INTO fpm_interactions SELECT * FROM backup_fpm_interactions;

-- Rollback user_clinic_referrals
-- TRUNCATE user_clinic_referrals;
-- INSERT INTO user_clinic_referrals SELECT * FROM backup_user_clinic_referrals;

-- SELECT 'All tables rolled back to backup state' as status;

-- ============================================================================
-- SECTION 10: CLEANUP BACKUP TABLES (AFTER VERIFICATION)
-- ============================================================================

-- ⚠️ Only drop backup tables after confirming cleanup was successful
-- and schema migration has been applied successfully

-- DROP TABLE IF EXISTS backup_conversations;
-- DROP TABLE IF EXISTS backup_user_responses;
-- DROP TABLE IF EXISTS backup_fpm_interactions;
-- DROP TABLE IF EXISTS backup_user_clinic_referrals;

-- SELECT 'Backup tables dropped' as status;

-- ============================================================================
-- END OF CLEANUP
-- ============================================================================

-- NEXT STEPS:
-- 1. Verify all NULL counts are 0
-- 2. Review data loss summary - acceptable?
-- 3. If acceptable, proceed to schema.prisma updates
-- 4. Generate migration: npx prisma migrate dev --name enforce-foreign-keys
-- 5. Update backend services to validate foreign keys
-- 6. Deploy and monitor

-- IMPORTANT NOTES:
-- - Backup tables are kept for safety - drop them only after successful deployment
-- - If data loss is unacceptable, investigate specific orphaned records before deletion
-- - Consider adding application-level validation to prevent future NULL foreign keys
-- - Monitor error logs after deployment for any foreign key constraint violations
