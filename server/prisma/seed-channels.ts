import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedChannels() {
  console.log('🌱 Seeding channels...');

  // Create Web Chat channel (default)
  const webChannel = await prisma.channel.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Web Chat',
      type: 'WEB',
      color: '#006045',
      icon: 'MessageCircle',
      description: 'Website chatbot interface - Main communication channel',
      autoAssignment: true,
      operatingStart: '00:00',
      operatingEnd: '23:59',
      isActive: true,
    },
  });
  console.log('✅ Web Chat channel created');

  // Create WhatsApp channel (inactive until configured)
  const whatsappChannel = await prisma.channel.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'WhatsApp',
      type: 'WHATSAPP',
      color: '#25D366',
      icon: 'MessageSquare',
      description: 'WhatsApp Business API integration',
      autoAssignment: true,
      operatingStart: '08:00',
      operatingEnd: '20:00',
      isActive: false, // Inactive until configured
      platformConfig: {
        businessId: '',
        phoneNumber: '',
        verifyToken: 'honey-whatsapp-verify',
        accessToken: '',
      },
    },
  });
  console.log('✅ WhatsApp channel created (inactive)');

  // Create Facebook Messenger channel (inactive until configured)
  const messengerChannel = await prisma.channel.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Facebook Messenger',
      type: 'MESSENGER',
      color: '#0084FF',
      icon: 'Facebook',
      description: 'Facebook Messenger integration',
      autoAssignment: true,
      operatingStart: '08:00',
      operatingEnd: '20:00',
      isActive: false, // Inactive until configured
      platformConfig: {
        pageId: '',
        accessToken: '',
        appSecret: '',
      },
    },
  });
  console.log('✅ Facebook Messenger channel created (inactive)');

  // Update existing conversations to use Web channel
  const updateCount = await prisma.conversation.updateMany({
    where: { channelId: null },
    data: { channelId: webChannel.id },
  });
  console.log(
    `✅ ${updateCount.count} existing conversations migrated to Web channel`,
  );

  console.log('\n🎉 Channel seeding complete!');
  console.log(`
📋 Summary:
- Web Chat: ✅ Active (${webChannel.id})
- WhatsApp: ⏸️  Inactive - Configure in Admin Dashboard (${whatsappChannel.id})
- Messenger: ⏸️  Inactive - Configure in Admin Dashboard (${messengerChannel.id})
- ${updateCount.count} conversations migrated to Web channel
  `);
}

seedChannels()
  .catch((error) => {
    console.error('❌ Error seeding channels:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
