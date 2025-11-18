/**
 * Database Cleanup Script - Remove Invalid UUIDs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('í´§ Starting database cleanup...\n');

  try {
    const deleted1 = await prisma.$executeRawUnsafe(`
      DELETE FROM "ConversationAssignment"
      WHERE NOT (agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
         OR NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);
    console.log(`âœ… Deleted ${deleted1} invalid ConversationAssignment records\n`);

    const updated = await prisma.$executeRawUnsafe(`
      UPDATE "Conversation"
      SET assigned_agent_id = NULL, escalation_status = NULL
      WHERE assigned_agent_id IS NOT NULL 
        AND NOT (assigned_agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);
    console.log(`âœ… Updated ${updated} Conversation records\n`);

    console.log('âœ¨ Cleanup completed successfully!\n');
  } catch (error) {
    console.error('âŒ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup().then(() => process.exit(0)).catch(() => process.exit(1));
