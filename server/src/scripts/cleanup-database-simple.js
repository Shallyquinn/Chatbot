/**
 * Database Cleanup Script - Remove Invalid UUIDs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('��� Starting database cleanup...\n');

  try {
    // Clean conversation_assignments table if it exists
    try {
      console.log('Cleaning conversation_assignments table...');
      const deleted1 = await prisma.$executeRawUnsafe(`
        DELETE FROM conversation_assignments
        WHERE NOT (agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
           OR NOT (admin_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
      `);
      console.log(
        `✅ Deleted ${deleted1} invalid conversation_assignments records\n`,
      );
    } catch (e) {
      if (e.code === 'P2010' || e.meta?.code === '42P01') {
        console.log(
          'ℹ️  conversation_assignments table does not exist yet (this is OK)\n',
        );
      } else {
        console.error('⚠️  Error with conversation_assignments:', e.message);
      }
    }

    // Clean conversations table (only assigned_agent_id, escalation_status may not exist yet)
    console.log('Cleaning conversations.assigned_agent_id...');
    try {
      const updated = await prisma.$executeRawUnsafe(`
        UPDATE conversations
        SET assigned_agent_id = NULL
        WHERE assigned_agent_id IS NOT NULL
          AND NOT (assigned_agent_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
      `);
      console.log(`✅ Updated ${updated} conversations records\n`);
    } catch (e) {
      if (e.meta?.code === '42703') {
        console.log(
          'ℹ️  assigned_agent_id column does not exist yet (this is OK)\n',
        );
      } else {
        throw e;
      }
    }

    console.log('✨ Cleanup completed successfully!\n');
    console.log('��� All invalid UUIDs have been removed');
    console.log('��� Now restart your server: npm run start:dev\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.meta) {
      console.error('   Code:', error.meta.code);
      console.error('   Message:', error.meta.message);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('\n��� Cleanup failed');
    process.exit(1);
  });
