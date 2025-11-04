/**
 * Database Cleanup Script - Remove Invalid UUIDs
 * Run this script to clean up invalid UUID data in the database
 *
 * Usage: npx ts-node src/scripts/cleanup-database.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupInvalidUUIDs() {
  console.log('🔧 Starting database cleanup...\n');

  try {
    // Step 1: Check for invalid UUIDs in ConversationAssignment
    console.log(
      '📊 Step 1: Checking for invalid UUIDs in ConversationAssignment...',
    );

    const invalidAssignments = await prisma.$queryRawUnsafe<any[]>(`
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
        OR NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    console.log(`   Found ${invalidAssignments.length} invalid records\n`);

    if (invalidAssignments.length > 0) {
      console.log('   Invalid records:');
      invalidAssignments.forEach((record, index) => {
        console.log(
          `   ${index + 1}. ID: ${record.id}, Agent: ${record.agent_id}, Admin: ${record.admin_id}`,
        );
      });
      console.log('');
    }

    // Step 2: Delete invalid ConversationAssignment records
    console.log(
      '🗑️  Step 2: Deleting invalid ConversationAssignment records...',
    );

    const deletedCount = await prisma.$executeRawUnsafe(`
      DELETE FROM "ConversationAssignment"
      WHERE NOT (agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
         OR NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    console.log(`   Deleted ${deletedCount} records\n`);

    // Step 3: Check for invalid assigned_agent_id in Conversation
    console.log(
      '📊 Step 3: Checking for invalid assigned_agent_id in Conversation...',
    );

    const invalidConversations = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        conversation_id,
        assigned_agent_id,
        escalation_status
      FROM "Conversation"
      WHERE
        assigned_agent_id IS NOT NULL
        AND NOT (assigned_agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    console.log(
      `   Found ${invalidConversations.length} invalid conversations\n`,
    );

    if (invalidConversations.length > 0) {
      console.log('   Invalid conversations:');
      invalidConversations.forEach((record, index) => {
        console.log(
          `   ${index + 1}. Conversation: ${record.conversation_id}, Agent: ${record.assigned_agent_id}`,
        );
      });
      console.log('');
    }

    // Step 4: Clean up invalid assigned_agent_id in Conversation
    console.log(
      '🧹 Step 4: Cleaning up invalid assigned_agent_id in Conversation...',
    );

    const updatedCount = await prisma.$executeRawUnsafe(`
      UPDATE "Conversation"
      SET assigned_agent_id = NULL,
          escalation_status = NULL
      WHERE
        assigned_agent_id IS NOT NULL
        AND NOT (assigned_agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    console.log(`   Updated ${updatedCount} conversations\n`);

    // Step 5: Verify cleanup
    console.log('✅ Step 5: Verifying cleanup...');

    const remainingInvalid = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as count
      FROM "ConversationAssignment"
      WHERE
        NOT (agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
        OR NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    const remainingInvalidConversations = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as count
      FROM "Conversation"
      WHERE assigned_agent_id IS NOT NULL
        AND NOT (assigned_agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    console.log(
      `   Remaining invalid ConversationAssignment records: ${remainingInvalid[0].count}`,
    );
    console.log(
      `   Remaining invalid Conversation records: ${remainingInvalidConversations[0].count}\n`,
    );

    // Step 6: Summary
    console.log('📊 Summary Report:');

    const totalAssignments = await prisma.conversationAssignment.count();
    const totalConversations = await prisma.conversation.count();

    console.log(`   Total ConversationAssignment records: ${totalAssignments}`);
    console.log(`   Total Conversation records: ${totalConversations}`);

    console.log('\n✅ Database cleanup completed successfully!\n');
    console.log('🔄 Next step: Restart your NestJS server');
    console.log('   Run: npm run start:dev\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupInvalidUUIDs()
  .then(() => {
    console.log('✨ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
