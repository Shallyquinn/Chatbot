// Test script to verify chat state sessions endpoints
// Run: node test-chat-state-sessions.js

const API_BASE = 'http://localhost:3000/chat-state-sessions';

async function testChatStateSessions() {
  console.log('🧪 Testing Chat State Sessions API...\n');

  const testSessionId = `test_session_${Date.now()}`;
  const testChatState = JSON.stringify({
    messages: [
      { message: 'Hello', type: 'bot', id: '1' },
      { message: 'Hi there!', type: 'user', id: '2' },
    ],
    currentStep: 'gender',
    selectedLanguage: 'English',
  });

  try {
    // 1. Create a new chat state session
    console.log('1️⃣ Creating new session...');
    const createResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_session_id: testSessionId,
        chat_state: testChatState,
        last_activity: new Date().toISOString(),
      }),
    });

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Session created:', createResult.session_id);
    } else {
      console.log(
        '❌ Create failed:',
        createResponse.status,
        await createResponse.text(),
      );
      return;
    }

    // 2. Get the session back
    console.log('\n2️⃣ Retrieving session...');
    const getResponse = await fetch(`${API_BASE}/${testSessionId}`);

    if (getResponse.ok) {
      const sessionData = await getResponse.json();
      console.log('✅ Session retrieved:', {
        chat_state_length: sessionData.chat_state.length,
        last_activity: sessionData.last_activity,
      });

      // Verify the data matches
      const parsedState = JSON.parse(sessionData.chat_state);
      if (parsedState.currentStep === 'gender') {
        console.log('✅ Data integrity verified');
      } else {
        console.log('❌ Data integrity failed');
      }
    } else {
      console.log(
        '❌ Get failed:',
        getResponse.status,
        await getResponse.text(),
      );
      return;
    }

    // 3. Update the session
    console.log('\n3️⃣ Updating session...');
    const updatedChatState = JSON.stringify({
      ...JSON.parse(testChatState),
      currentStep: 'age',
      selectedGender: 'Female',
    });

    const updateResponse = await fetch(`${API_BASE}/${testSessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_state: updatedChatState,
      }),
    });

    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Session updated');

      // Verify update
      const parsedUpdated = JSON.parse(updateResult.chat_state);
      if (parsedUpdated.currentStep === 'age') {
        console.log('✅ Update verified');
      }
    } else {
      console.log(
        '❌ Update failed:',
        updateResponse.status,
        await updateResponse.text(),
      );
    }

    // 4. Clean up - delete the session
    console.log('\n4️⃣ Cleaning up...');
    const deleteResponse = await fetch(`${API_BASE}/${testSessionId}`, {
      method: 'DELETE',
    });

    if (deleteResponse.ok) {
      console.log('✅ Session deleted');
    } else {
      console.log('❌ Delete failed:', deleteResponse.status);
    }

    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log(
      '\n💡 Make sure your server is running on http://localhost:3000',
    );
    console.log('💡 And the chat_state_sessions table exists in your database');
  }
}

// Run the test
testChatStateSessions();
