/**
 * Script to create initial agents via API
 * Run this after the server is started
 */

const API_BASE_URL = 'http://localhost:3000';

// Get admin token first
async function getAdminToken() {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@honeychatbot.com',
      password: 'admin123',
    }),
  });

  const data = await response.json();
  console.log('Login response:', data);

  // Handle both response formats
  if (data.success && data.data && data.data.access_token) {
    return data.data.access_token;
  } else if (data.access_token) {
    return data.access_token;
  }

  throw new Error('Failed to get admin token');
}

// Create agents
async function createAgents() {
  try {
    const token = await getAdminToken();
    console.log('✅ Got admin token:', token.substring(0, 20) + '...');

    const agents = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@honeychatbot.com',
        password: 'agent123',
        maxChats: 5,
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@honeychatbot.com',
        password: 'agent123',
        maxChats: 5,
      },
      {
        firstName: 'Aisha',
        lastName: 'Ibrahim',
        email: 'aisha@honeychatbot.com',
        password: 'agent123',
        maxChats: 3,
      },
      {
        firstName: 'David',
        lastName: 'Martinez',
        email: 'david@honeychatbot.com',
        password: 'agent123',
        maxChats: 5,
      },
    ];

    for (const agent of agents) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/agents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(agent),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`✅ Created agent: ${agent.firstName} ${agent.lastName}`);
          console.log('   Agent data:', result);
        } else {
          console.error(
            `❌ Failed to create ${agent.firstName} ${agent.lastName}:`,
            result,
          );
        }
      } catch (error) {
        console.error(
          `❌ Error creating ${agent.firstName} ${agent.lastName}:`,
          error,
        );
      }
    }

    // Verify agents were created
    console.log('\n📋 Fetching all agents...');
    const agentsResponse = await fetch(`${API_BASE_URL}/admin/agents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const allAgents = await agentsResponse.json();
    console.log('✅ Total agents in database:', allAgents.length);
    console.log('Agents:', allAgents);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
createAgents();
