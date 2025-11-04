# How to Test Agent Management Feature

## Quick Start - Testing the Feature

### Prerequisites

Ensure both server and frontend are running:

```bash
# Terminal 1 - Start Backend Server
cd "c:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot\server"
npm run start:dev

# Terminal 2 - Start Frontend
cd "c:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot\honey"
npm run dev
```

### Access the Admin Dashboard

1. Open browser: http://localhost:5173
2. Login as admin (use your admin credentials)
3. Navigate to Admin Dashboard

## Test Scenarios

### ✅ Test 1: Open Agent Management Modal

**Steps:**

1. Find the "Onboard Agent" button (usually in the top right or header area)
2. Click the button
3. **Expected Result**: Modal opens with two tabs visible:
   - "Add New Agent" (active by default)
   - "Manage Agents (X)" where X is the number of agents

**What to Check:**

- Modal appears centered on screen with dark overlay
- Modal has smooth fadeIn animation
- Body scroll is locked (page behind modal shouldn't scroll)
- Close button (X) is visible in top-right corner

---

### ✅ Test 2: Add New Agent Form Validation

**Steps:**

1. With modal open on "Add New Agent" tab
2. Click "Add Agent" button WITHOUT filling any fields
3. **Expected Result**: Red borders and error messages appear:
   - First name: "First name is required"
   - Last name: "Last name is required"
   - Email: "Email is required"
   - Role: "Please select a role"

**What to Check:**

- All 4 fields show errors simultaneously
- Error messages are red and appear below each field
- Form does NOT submit

---

### ✅ Test 3: Email Validation

**Steps:**

1. Fill in First Name: "Test"
2. Fill in Last Name: "Agent"
3. Fill in Email: "notanemail" (invalid format)
4. Select any role
5. Click "Add Agent"
6. **Expected Result**: Email field shows "Please enter a valid email address"

**What to Check:**

- Only email field shows error (other fields are valid)
- Form does NOT submit
- Error disappears when you type a valid email

---

### ✅ Test 4: Add New Agent Successfully

**Steps:**

1. Fill in First Name: "John"
2. Fill in Last Name: "Doe"
3. Fill in Email: "john.doe@test.com"
4. Click Role dropdown
5. Select "Support Agent"
6. Click "Add Agent"
7. **Expected Result**:
   - Green success notification appears: "Agent John Doe has been onboarded successfully!"
   - Modal automatically closes
   - Agent list refreshes (new agent appears)

**What to Check:**

- Notification appears at top/corner of screen
- Notification auto-disappears after 3 seconds
- Modal closes automatically
- If you reopen the modal and go to "Manage Agents", John Doe should be visible

---

### ✅ Test 5: Role Dropdown Functionality

**Steps:**

1. Open modal → "Add New Agent" tab
2. Click on the Role dropdown
3. **Expected Result**: Dropdown opens showing 5 roles:
   - Support Agent
   - Senior Agent
   - Team Lead
   - Manager
   - Administrator

**What to Check:**

- All 5 roles are visible
- Clicking a role selects it and closes dropdown
- Selected role appears in the dropdown button
- Dropdown has smooth animation
- Clicking outside dropdown closes it (test by clicking anywhere else)

---

### ✅ Test 6: Switch to Manage Agents Tab

**Steps:**

1. Open modal
2. Click "Manage Agents (X)" tab
3. **Expected Result**: View switches to show:
   - Search bar at top
   - List of all agents below
   - Each agent card shows: name, email, status badge, chat counter, delete button

**What to Check:**

- Tab switches smoothly (no page reload)
- Active tab has white background and green text
- Agent count in tab matches number of agents shown
- All agent data displays correctly

---

### ✅ Test 7: Search for Agents

**Steps:**

1. Go to "Manage Agents" tab
2. Type part of an agent's name in search bar (e.g., "John")
3. **Expected Result**: List filters in real-time showing only matching agents

**What to Check:**

- Search is case-insensitive
- Partial matches work (e.g., "joh" finds "John")
- Search also works with email addresses
- If no matches: Shows "No agents found matching your search"
- Clearing search shows all agents again

---

### ✅ Test 8: Agent Status Badges

**Steps:**

1. Go to "Manage Agents" tab
2. Look at each agent card
3. **Expected Result**: Status badge with colored dot:
   - 🟢 ONLINE = Green badge + green dot
   - 🟡 AWAY = Yellow badge + yellow dot
   - ⚫ OFFLINE = Gray badge + gray dot

**What to Check:**

- Badge colors match status
- Small circular dot appears before status text
- Badge is rounded and clearly visible

---

### ✅ Test 9: Delete Agent - Cancel

**Steps:**

1. Go to "Manage Agents" tab
2. Find any agent
3. Click the 🗑️ trash icon (red) on the right side
4. **Expected Result**: Card transforms to show:
   - ⚠️ Warning icon (orange triangle)
   - Text: "Delete this agent?"
   - Subtitle: "This action cannot be undone"
   - Two buttons: "Cancel" and "Delete"
5. Click "Cancel"
6. **Expected Result**: Card reverts back to normal agent display

**What to Check:**

- Transformation is smooth (inline, no new modal)
- Warning message is clear
- Cancel button brings back original card
- No API call is made (check network tab)

---

### ✅ Test 10: Delete Agent - Confirm

**Steps:**

1. Go to "Manage Agents" tab
2. Find an agent to delete (use a test agent, not a real one!)
3. Click the 🗑️ trash icon
4. Click "Delete" button (red)
5. **Expected Result**:
   - Green success notification: "Agent [Name] has been removed successfully!"
   - Agent list refreshes
   - Deleted agent no longer appears in list
   - Tab badge count decreases by 1

**What to Check:**

- Notification shows correct agent name
- Agent is immediately removed from list
- If you refresh the page, agent is still gone (permanent delete)
- No errors in browser console (F12 → Console tab)

---

### ✅ Test 11: Try to Delete Agent with Active Chats

**Steps:**

1. Find an agent who has active conversations (currentChats > 0)
2. Try to delete them
3. **Expected Result**:
   - Red error notification appears
   - Message: "Cannot delete agent with active conversations. Please reassign or complete their conversations first."
   - Agent is NOT deleted

**What to Check:**

- Error notification is red (not green)
- Agent remains in the list
- Message clearly explains why deletion failed

---

### ✅ Test 12: Mobile Responsiveness (Optional)

**Steps:**

1. Resize browser window to mobile size (< 768px width)
2. Open Agent Management Modal
3. **Expected Result**:
   - Modal still fits on screen
   - Form fields stack vertically
   - First Name and Last Name fields become full-width (one per row)
   - Search and agent cards remain readable

**What to Check:**

- No horizontal scrolling
- All text is readable
- Buttons are easily clickable on mobile
- Modal doesn't overflow screen

---

### ✅ Test 13: Click Outside to Close

**Steps:**

1. Open Agent Management Modal
2. Click on the dark overlay (not on the white modal box)
3. **Expected Result**: Modal closes

**What to Check:**

- Clicking overlay closes modal
- Clicking inside modal does NOT close it
- Body scroll is restored after closing

---

### ✅ Test 14: Close Button (X)

**Steps:**

1. Open Agent Management Modal
2. Click the X button in top-right corner
3. **Expected Result**: Modal closes smoothly

**What to Check:**

- X button is visible and clearly clickable
- Modal closes with fadeOut animation
- Any unsaved form data is cleared (reopen to verify)

---

## Common Issues & Solutions

### Issue 1: Modal Doesn't Open

**Possible Causes:**

- Button not connected to modal state
- JavaScript error in console

**Debug Steps:**

1. Open browser console (F12)
2. Click "Onboard Agent" button
3. Check for red errors in console
4. Verify showOnboardModal state changes

---

### Issue 2: Delete Doesn't Work

**Possible Causes:**

- Backend server not running
- Agent has active conversations
- API endpoint not accessible

**Debug Steps:**

1. Open Network tab (F12 → Network)
2. Try deleting agent
3. Look for DELETE request to `/admin/agents/:id`
4. Check response status:
   - 200 = Success
   - 400 = Bad Request (has active chats)
   - 404 = Agent not found
   - 500 = Server error

---

### Issue 3: Form Validation Not Working

**Possible Causes:**

- JavaScript disabled
- Component not rendering correctly

**Debug Steps:**

1. Check browser console for errors
2. Try typing in each field to see if errors clear
3. Verify formData state is updating (React DevTools)

---

### Issue 4: Agents List Doesn't Refresh

**Possible Causes:**

- refetchAgents() not being called
- API not returning updated data

**Debug Steps:**

1. Manual refresh: Close modal, click agents tab, reopen modal
2. Check Network tab for GET request to `/admin/agents`
3. Verify response includes/excludes the added/deleted agent

---

## Backend Testing (Optional)

### Test Backend Endpoints Directly

#### 1. Get All Agents

```bash
curl -X GET http://localhost:3000/admin/agents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 2. Create Agent

```bash
curl -X POST http://localhost:3000/admin/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "Test",
    "lastName": "Agent",
    "email": "test@example.com",
    "password": "Password123!",
    "maxChats": 5
  }'
```

#### 3. Delete Agent

```bash
curl -X DELETE http://localhost:3000/admin/agents/AGENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Success Criteria

✅ **All Tests Passing:**

- Modal opens/closes correctly
- Form validation works
- Agents can be added successfully
- Agents can be deleted (with confirmation)
- Search filters correctly
- Error handling works (active chats prevent deletion)
- Notifications appear and auto-dismiss
- Mobile responsive design works

✅ **No Console Errors:**

- No red errors in browser console
- No 404 or 500 errors in Network tab
- No React warnings in console

✅ **Data Persistence:**

- Added agents persist after page refresh
- Deleted agents stay deleted after page refresh
- Changes reflect in database

---

## Next Steps After Testing

1. **If All Tests Pass:**

   - ✅ Feature is complete and working
   - Ready for production deployment
   - Consider adding more agents to test scalability

2. **If Tests Fail:**

   - Check AGENT_MANAGEMENT_COMPLETE.md for troubleshooting
   - Review browser console for error messages
   - Verify backend server is running
   - Check database connections

3. **Enhancements (Future):**
   - Bulk delete multiple agents
   - Edit agent details inline
   - Export agents list to CSV
   - Advanced filtering options

---

## Quick Checklist

Use this quick checklist to verify everything works:

- [ ] Modal opens when clicking "Onboard Agent" button
- [ ] Both tabs ("Add New Agent" and "Manage Agents") are visible
- [ ] Form validation shows errors for empty/invalid fields
- [ ] Email validation rejects invalid email formats
- [ ] Role dropdown shows all 5 roles
- [ ] Adding new agent shows success notification
- [ ] New agent appears in "Manage Agents" list
- [ ] Search bar filters agents correctly
- [ ] Status badges (ONLINE/AWAY/OFFLINE) display correctly
- [ ] Delete button shows confirmation dialog
- [ ] Canceling delete reverts to agent card
- [ ] Confirming delete removes agent from list
- [ ] Error shown when trying to delete agent with active chats
- [ ] Modal closes with X button
- [ ] Modal closes when clicking outside
- [ ] Mobile view is responsive (< 768px width)

**All checkboxes checked = Feature is fully working! 🎉**
