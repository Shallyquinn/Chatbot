-- DATABASE AUDIT AND DATA INTEGRITY CHECK SCRIPT
-- Purpose: Identify all records with NULL foreign keys and orphaned data
-- Run this BEFORE making schema changes to understand the scope of the problem

-- ============================================================================
-- SECTION 1: CONVERSATION TABLE AUDIT
-- ============================================================================

-- 1.1: Count conversations with NULL session_id
SELECT 
  'Conversations with NULL session_id' as issue,
  COUNT(*) as count
FROM conversations
WHERE session_id IS NULL;

-- 1.2: Count conversations with NULL user_id
SELECT 
  'Conversations with NULL user_id' as issue,
  COUNT(*) as count
FROM conversations
WHERE user_id IS NULL;

-- 1.3: Count conversations with BOTH NULL (orphaned)
SELECT 
  'Conversations with NULL session_id AND user_id (ORPHANED)' as issue,
  COUNT(*) as count
FROM conversations
WHERE session_id IS NULL AND user_id IS NULL;

-- 1.4: Show sample of orphaned conversations
SELECT 
  conversation_id,
  message_text,
  message_type,
  chat_step,
  created_at
FROM conversations
WHERE session_id IS NULL OR user_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 1.5: Check for invalid foreign keys (pointing to non-existent records)
SELECT 
  'Conversations with invalid session_id' as issue,
  COUNT(*) as count
FROM conversations c
LEFT JOIN chat_sessions cs ON c.session_id = cs.session_id
WHERE c.session_id IS NOT NULL AND cs.session_id IS NULL;

SELECT 
  'Conversations with invalid user_id' as issue,
  COUNT(*) as count
FROM conversations c
LEFT JOIN users u ON c.user_id = u.user_id
WHERE c.user_id IS NOT NULL AND u.user_id IS NULL;

-- ============================================================================
-- SECTION 2: USER_RESPONSES TABLE AUDIT
-- ============================================================================

-- 2.1: Count responses with NULL user_id
SELECT 
  'UserResponses with NULL user_id' as issue,
  COUNT(*) as count
FROM user_responses
WHERE user_id IS NULL;

-- 2.2: Count responses with NULL session_id
SELECT 
  'UserResponses with NULL session_id' as issue,
  COUNT(*) as count
FROM user_responses
WHERE session_id IS NULL;

-- 2.3: Count responses with NULL conversation_id (CRITICAL)
SELECT 
  'UserResponses with NULL conversation_id (CRITICAL)' as issue,
  COUNT(*) as count
FROM user_responses
WHERE conversation_id IS NULL;

-- 2.4: Count responses missing ALL foreign keys
SELECT 
  'UserResponses with ALL foreign keys NULL (ORPHANED)' as issue,
  COUNT(*) as count
FROM user_responses
WHERE user_id IS NULL 
  AND session_id IS NULL 
  AND conversation_id IS NULL;

-- 2.5: Check for invalid foreign keys
SELECT 
  'UserResponses with invalid conversation_id' as issue,
  COUNT(*) as count
FROM user_responses ur
LEFT JOIN conversations c ON ur.conversation_id = c.conversation_id
WHERE ur.conversation_id IS NOT NULL AND c.conversation_id IS NULL;

-- ============================================================================
-- SECTION 3: FPM_INTERACTIONS TABLE AUDIT
-- ============================================================================

-- 3.1: Count FPM interactions with NULL user_id
SELECT 
  'FpmInteractions with NULL user_id' as issue,
  COUNT(*) as count
FROM fpm_interactions
WHERE user_id IS NULL;

-- 3.2: Count FPM interactions with NULL session_id
SELECT 
  'FpmInteractions with NULL session_id' as issue,
  COUNT(*) as count
FROM fpm_interactions
WHERE session_id IS NULL;

-- 3.3: Count FPM interactions missing BOTH
SELECT 
  'FpmInteractions with NULL user_id AND session_id (ORPHANED)' as issue,
  COUNT(*) as count
FROM fpm_interactions
WHERE user_id IS NULL AND session_id IS NULL;

-- 3.4: Show sample of orphaned FPM interactions
SELECT 
  interaction_id,
  fpm_flow_type,
  current_fpm_method,
  interested_fpm_method,
  user_session_id,
  created_at
FROM fpm_interactions
WHERE user_id IS NULL OR session_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- SECTION 4: USER_CLINIC_REFERRALS TABLE AUDIT
-- ============================================================================

-- 4.1: Count referrals with NULL user_id
SELECT 
  'UserClinicReferrals with NULL user_id' as issue,
  COUNT(*) as count
FROM user_clinic_referrals
WHERE user_id IS NULL;

-- 4.2: Count referrals with NULL session_id
SELECT 
  'UserClinicReferrals with NULL session_id' as issue,
  COUNT(*) as count
FROM user_clinic_referrals
WHERE session_id IS NULL;

-- 4.3: Count referrals with NULL clinic_id (CRITICAL)
SELECT 
  'UserClinicReferrals with NULL clinic_id (CRITICAL)' as issue,
  COUNT(*) as count
FROM user_clinic_referrals
WHERE clinic_id IS NULL;

-- 4.4: Count referrals missing ALL foreign keys
SELECT 
  'UserClinicReferrals with ALL foreign keys NULL (ORPHANED)' as issue,
  COUNT(*) as count
FROM user_clinic_referrals
WHERE user_id IS NULL 
  AND session_id IS NULL 
  AND clinic_id IS NULL;

-- ============================================================================
-- SECTION 5: CONVERSATION_ANALYTICS TABLE AUDIT
-- ============================================================================

-- 5.1: Count analytics with NULL user_id
SELECT 
  'ConversationAnalytics with NULL user_id' as issue,
  COUNT(*) as count
FROM conversation_analytics
WHERE user_id IS NULL;

-- 5.2: Show sample of anonymous analytics
SELECT 
  analytics_id,
  session_duration_seconds,
  message_count,
  bot_message_count,
  user_message_count,
  created_at
FROM conversation_analytics
WHERE user_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- SECTION 6: CHAT_SESSIONS TABLE AUDIT
-- ============================================================================

-- 6.1: Count sessions with NULL user_id (acceptable for guest sessions)
SELECT 
  'ChatSessions with NULL user_id (Guest Sessions)' as issue,
  COUNT(*) as count
FROM chat_sessions
WHERE user_id IS NULL;

-- 6.2: Check if guest sessions have conversations
SELECT 
  'Guest sessions with conversations' as info,
  COUNT(DISTINCT c.conversation_id) as conversation_count
FROM chat_sessions cs
INNER JOIN conversations c ON cs.session_id = c.session_id
WHERE cs.user_id IS NULL;

-- ============================================================================
-- SECTION 7: SUMMARY REPORT
-- ============================================================================

-- 7.1: Overall data integrity summary
SELECT 
  'CRITICAL ISSUES SUMMARY' as section,
  (SELECT COUNT(*) FROM conversations WHERE session_id IS NULL OR user_id IS NULL) as orphaned_conversations,
  (SELECT COUNT(*) FROM user_responses WHERE conversation_id IS NULL) as orphaned_responses,
  (SELECT COUNT(*) FROM fpm_interactions WHERE user_id IS NULL OR session_id IS NULL) as orphaned_fpm,
  (SELECT COUNT(*) FROM user_clinic_referrals WHERE user_id IS NULL OR session_id IS NULL OR clinic_id IS NULL) as orphaned_referrals,
  (SELECT COUNT(*) FROM conversation_analytics WHERE user_id IS NULL) as anonymous_analytics;

-- 7.2: Total records in each table
SELECT 'Total Records' as info,
  (SELECT COUNT(*) FROM conversations) as conversations,
  (SELECT COUNT(*) FROM user_responses) as responses,
  (SELECT COUNT(*) FROM fpm_interactions) as fpm_interactions,
  (SELECT COUNT(*) FROM user_clinic_referrals) as referrals,
  (SELECT COUNT(*) FROM conversation_analytics) as analytics,
  (SELECT COUNT(*) FROM chat_sessions) as sessions,
  (SELECT COUNT(*) FROM users) as users;

-- 7.3: Data integrity percentage
SELECT 
  'Data Integrity Percentage' as metric,
  ROUND(
    (1 - (
      COALESCE((SELECT COUNT(*) FROM conversations WHERE session_id IS NULL OR user_id IS NULL), 0) +
      COALESCE((SELECT COUNT(*) FROM user_responses WHERE conversation_id IS NULL), 0) +
      COALESCE((SELECT COUNT(*) FROM fpm_interactions WHERE user_id IS NULL OR session_id IS NULL), 0)
    )::NUMERIC / 
    NULLIF((
      COALESCE((SELECT COUNT(*) FROM conversations), 1) +
      COALESCE((SELECT COUNT(*) FROM user_responses), 1) +
      COALESCE((SELECT COUNT(*) FROM fpm_interactions), 1)
    ), 0)
    ) * 100,
    2
  ) as integrity_percentage;

-- ============================================================================
-- SECTION 8: RELATIONSHIPS ANALYSIS
-- ============================================================================

-- 8.1: Users without any conversations
SELECT 
  'Users with no conversations' as issue,
  COUNT(*) as count
FROM users u
LEFT JOIN conversations c ON u.user_id = c.user_id
WHERE c.conversation_id IS NULL;

-- 8.2: Sessions without any conversations
SELECT 
  'Sessions with no conversations' as issue,
  COUNT(*) as count
FROM chat_sessions cs
LEFT JOIN conversations c ON cs.session_id = c.session_id
WHERE c.conversation_id IS NULL;

-- 8.3: Conversations without responses
SELECT 
  'Conversations with no UserResponses' as issue,
  COUNT(*) as count
FROM conversations c
LEFT JOIN user_responses ur ON c.conversation_id = ur.conversation_id
WHERE ur.response_id IS NULL
  AND c.message_type = 'user'; -- Only check user messages

-- 8.4: Users with mismatched session relationships
SELECT 
  'Users with session mismatch' as issue,
  COUNT(*) as count
FROM conversations c
INNER JOIN chat_sessions cs ON c.session_id = cs.session_id
WHERE c.user_id != cs.user_id
  AND c.user_id IS NOT NULL
  AND cs.user_id IS NOT NULL;

-- ============================================================================
-- SECTION 9: TEMPORAL ANALYSIS
-- ============================================================================

-- 9.1: NULL foreign keys by date (to identify when the issue started)
SELECT 
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE session_id IS NULL) as null_session_count,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_user_count,
  COUNT(*) as total_conversations
FROM conversations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 9.2: Data quality trend over last 7 days
SELECT 
  DATE(created_at) as date,
  ROUND(
    (1 - COUNT(*) FILTER (WHERE session_id IS NULL OR user_id IS NULL)::NUMERIC / COUNT(*)) * 100,
    2
  ) as integrity_percentage
FROM conversations
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================================================
-- SECTION 10: AGENT SYSTEM AUDIT
-- ============================================================================

-- 10.1: Conversation assignments without valid conversation_id
SELECT 
  'ConversationAssignments with invalid conversation' as issue,
  COUNT(*) as count
FROM conversation_assignments ca
LEFT JOIN conversations c ON ca.conversation_id = c.conversation_id
WHERE c.conversation_id IS NULL;

-- 10.2: Conversation assignments without valid agent_id
SELECT 
  'ConversationAssignments with invalid agent' as issue,
  COUNT(*) as count
FROM conversation_assignments ca
LEFT JOIN agents a ON ca.agent_id = a.agent_id
WHERE a.agent_id IS NULL;

-- 10.3: Conversations in queue without conversation_id
SELECT 
  'ConversationQueue with invalid conversation' as issue,
  COUNT(*) as count
FROM conversation_queue cq
LEFT JOIN conversations c ON cq.conversation_id = c.conversation_id
WHERE c.conversation_id IS NULL;

-- ============================================================================
-- SECTION 11: CHANNEL SYSTEM AUDIT
-- ============================================================================

-- 11.1: Conversations with NULL channel_id
SELECT 
  'Conversations with NULL channel_id' as issue,
  COUNT(*) as count
FROM conversations
WHERE channel_id IS NULL;

-- 11.2: Channel messages without valid conversation_id
SELECT 
  'ChannelMessages with invalid conversation' as issue,
  COUNT(*) as count
FROM channel_messages cm
LEFT JOIN conversations c ON cm.conversation_id = c.conversation_id
WHERE c.conversation_id IS NULL;

-- 11.3: Channel messages without valid channel_id
SELECT 
  'ChannelMessages with invalid channel' as issue,
  COUNT(*) as count
FROM channel_messages cm
LEFT JOIN channels ch ON cm.channel_id = ch.id
WHERE ch.id IS NULL;

-- ============================================================================
-- SECTION 12: EXPORT PROBLEMATIC RECORDS (FOR BACKUP)
-- ============================================================================

-- 12.1: Export all orphaned conversations to review
CREATE TEMPORARY TABLE temp_orphaned_conversations AS
SELECT *
FROM conversations
WHERE session_id IS NULL OR user_id IS NULL;

SELECT 
  'Orphaned conversations backed up to temp_orphaned_conversations' as info,
  COUNT(*) as count
FROM temp_orphaned_conversations;

-- 12.2: Export all orphaned responses
CREATE TEMPORARY TABLE temp_orphaned_responses AS
SELECT *
FROM user_responses
WHERE user_id IS NULL OR session_id IS NULL OR conversation_id IS NULL;

SELECT 
  'Orphaned responses backed up to temp_orphaned_responses' as info,
  COUNT(*) as count
FROM temp_orphaned_responses;

-- ============================================================================
-- END OF AUDIT
-- ============================================================================

-- RECOMMENDATIONS:
-- 1. If orphaned records count > 0: Run data cleanup scripts before migration
-- 2. If integrity percentage < 95%: Investigate code that creates records
-- 3. If temporal analysis shows recent issues: Check latest code changes
-- 4. Always backup database before running fix scripts

-- NEXT STEPS:
-- 1. Review this audit output
-- 2. Run data cleanup scripts (see DATA_CLEANUP_SCRIPTS.sql)
-- 3. Update schema.prisma to enforce foreign keys
-- 4. Generate and run migration
-- 5. Update backend services to reject NULL foreign keys
-- 6. Deploy and monitor
