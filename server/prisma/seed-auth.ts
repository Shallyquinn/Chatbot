import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding authentication data...');

  // Create default admin
  const adminExists = await prisma.admin.findUnique({
    where: { email: 'admin@honeychatbot.com' },
  });

  if (!adminExists) {
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.admin.create({
      data: {
        name: 'Honey Admin',
        email: 'admin@honeychatbot.com',
        password: hashedAdminPassword,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Created default admin:', {
      email: admin.email,
      password: 'admin123',
      role: admin.role,
    });
  } else {
    console.log('ℹ️  Admin already exists:', adminExists.email);
  }

  // Create second admin
  const secondAdminExists = await prisma.admin.findUnique({
    where: { email: 'admin2@honeychatbot.com' },
  });

  if (!secondAdminExists) {
    const hashedAdmin2Password = await bcrypt.hash('admin456', 10);

    const admin2 = await prisma.admin.create({
      data: {
        name: 'Second Admin',
        email: 'admin2@honeychatbot.com',
        password: hashedAdmin2Password,
        role: 'ADMIN',
      },
    });

    console.log('✅ Created second admin:', {
      email: admin2.email,
      password: 'admin456',
      role: admin2.role,
    });
  } else {
    console.log('ℹ️  Second admin already exists:', secondAdminExists.email);
  }

  // Create default dummy/system agent
  const dummyAgentExists = await prisma.agent.findUnique({
    where: { email: 'dummy@honeychatbot.com' },
  });

  if (!dummyAgentExists) {
    const hashedDummyPassword = await bcrypt.hash('dummy123', 10);

    const dummyAgent = await prisma.agent.create({
      data: {
        name: 'System Agent (Default)',
        email: 'dummy@honeychatbot.com',
        password: hashedDummyPassword,
        status: 'ONLINE',
        maxChats: 999,
        isOnline: true,
      },
    });

    console.log('✅ Created dummy/default agent:', {
      email: dummyAgent.email,
      password: 'dummy123',
      role: 'SYSTEM_DEFAULT',
    });
  } else {
    console.log('ℹ️  Dummy agent already exists:', dummyAgentExists.email);
  }

  // Create default agents
  const agents = [
    {
      name: 'Sarah Johnson',
      email: 'sarah@honeychatbot.com',
      password: 'agent123',
      status: 'ONLINE' as const,
      maxChats: 5,
    },
    {
      name: 'Michael Chen',
      email: 'michael@honeychatbot.com',
      password: 'agent123',
      status: 'ONLINE' as const,
      maxChats: 5,
    },
    {
      name: 'Aisha Ibrahim',
      email: 'aisha@honeychatbot.com',
      password: 'agent123',
      status: 'OFFLINE' as const,
      maxChats: 3,
    },
  ];

  for (const agentData of agents) {
    const agentExists = await prisma.agent.findUnique({
      where: { email: agentData.email },
    });

    if (!agentExists) {
      const hashedPassword = await bcrypt.hash(agentData.password, 10);

      const agent = await prisma.agent.create({
        data: {
          name: agentData.name,
          email: agentData.email,
          password: hashedPassword,
          status: agentData.status,
          maxChats: agentData.maxChats,
          isOnline: agentData.status === 'ONLINE',
        },
      });

      console.log('✅ Created agent:', {
        name: agent.name,
        email: agent.email,
        password: agentData.password,
        status: agent.status,
      });
    } else {
      console.log('ℹ️  Agent already exists:', agentData.email);
    }
  }

  console.log('\n🎉 Authentication seeding complete!');
  console.log('\n📝 Login Credentials:');
  console.log('\n🔐 ADMINS:');
  console.log('   1. Email: admin@honeychatbot.com | Password: admin123 (SUPER_ADMIN)');
  console.log('   2. Email: admin2@honeychatbot.com | Password: admin456 (ADMIN)');
  console.log('\n🤖 DUMMY/SYSTEM AGENT (Auto-assigned):');
  console.log('   Email: dummy@honeychatbot.com');
  console.log('   (This agent receives unassigned conversations)');
  console.log('\n👥 AGENTS:');
  console.log('   1. Email: sarah@honeychatbot.com | Password: agent123');
  console.log('   2. Email: michael@honeychatbot.com | Password: agent123');
  console.log('   3. Email: aisha@honeychatbot.com | Password: agent123');
  console.log('\n🚀 You can now login at:');
  console.log('   Admin: http://localhost:5173/admin/login');
  console.log('   Agent: http://localhost:5173/agent/login');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding authentication data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
