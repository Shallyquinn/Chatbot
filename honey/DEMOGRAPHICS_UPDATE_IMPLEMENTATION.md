# Demographics Update Implementation

## Overview

This document outlines the implementation of session persistence and demographic tagging functionality in the Honey chatbot.

## Server-Based Session Persistence

Session persistence has been upgraded to a robust server-first approach:

- **Server-First Storage**: Primary state storage on the backend database via API
- **localStorage Fallback**: Automatic fallback to localStorage if server is unavailable
- **Cross-Device Sync**: Users can continue conversations across different devices/browsers
- **WhatsApp Ready**: Architecture compatible with future WhatsApp integration
- **Hybrid Approach**: Best of both worlds - server reliability with offline capability

## Demographic Tagging System

### Tags Added

All demographic handlers now include appropriate tags to identify them:

- `language_selection` - Language choice
- `gender_selection` - Gender choice
- `state_selection` - State/location choice
- `lga_selection` - Local Government Area choice
- `age_selection` - Age group choice
- `marital_status_selection` - Marital status choice

### Implementation Details

1. **ChatMessage Interface**: Extended with optional `tag` property
2. **Handler Updates**: All demographic handlers updated to include tags in user messages
3. **Type Safety**: Added `DemographicTag` type for better type checking
4. **CreateChatBotMessage**: Updated to support tag options

## Demographics Update Functionality

### New Keyword: "demographics"

Users can now type "demographics" to update their information:

```typescript
// Triggers the demographics update flow
handleDemographicsUpdate = (): void => {
  // Shows current information summary
  // Walks through each demographic question in order
};
```

### Features

- **Current Info Display**: Shows what information is already stored
- **Sequential Updates**: Walks through each demographic question in logical order
- **Keyword Recognition**: Responds to "demographics", "update info", "update details", etc.
- **Help Integration**: Added to keyword help menu

### MessageParser Integration

- Added demographics keyword handling in the default case
- Integrated with existing keyword navigation system
- Enhanced generic response to mention demographics feature

## Usage Examples

### For Users

1. Type "demographics" to update personal information
2. Type "menu" to see all available options (including demographics)
3. The system will show current information and walk through updates

### For Returning Users

- Session persistence means demographic information is remembered
- Users can selectively update just the information they want to change
- Clear display of current vs. new information

## Benefits

1. **Better UX**: Users can easily update their information without starting over
2. **Data Accuracy**: Tagged demographic data makes it easy to identify and update specific information
3. **Session Continuity**: No loss of information between sessions
4. **Flexible Updates**: Users can update just specific demographics without going through entire flow

## Technical Implementation

- **Backward Compatible**: All existing functionality preserved
- **Type Safe**: Full TypeScript support with proper typing
- **Consistent Pattern**: Follows established chatbot patterns
- **Error Handling**: Proper error handling and fallbacks included

### Server-Side Session Management

- **API Endpoints**: Added `saveUserSession()` and `getUserSession()` to api.ts
- **Database Integration**: Sessions stored with user_session_id, chat_state JSON, and timestamps
- **Type Safety**: Full TypeScript support with ChatStateSession interface
- **Error Handling**: Graceful fallbacks when server is unavailable

### Enhanced ActionProvider

- **Dual Storage**: Every setState automatically saves to both server and localStorage
- **Async Loading**: Attempts server load on initialization, falls back to localStorage
- **Session Restoration**: Complete state recovery including messages, user selections, and conversation flow

### Deployment Benefits

- **Web Ready**: Immediate cross-device synchronization for web users
- **WhatsApp Compatible**: Easy adaptation for WhatsApp bot using same session management
- **Offline Resilient**: Works even when server is temporarily unavailable
- **Analytics Ready**: All session data available for user behavior analysis
