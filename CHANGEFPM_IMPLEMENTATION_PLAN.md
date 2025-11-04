# Change/Stop FPM Flow - Implementation Plan

## Overview

This document provides a complete implementation plan for aligning the Change/Stop FPM flow with the Draw.io flowchart and WhatsApp script, ensuring all messages, interactions, and data are properly stored in the database.

## Scope Analysis

### Files Analyzed

1. **Flowchart**: `changefpm.drawio.xml` (18,252 lines, 3,000+ messages)
2. **WhatsApp Script**: `WhatsApp Chat with Honey AI Chatbot.txt` (8,499 lines, 1,758 bot messages)
3. **Current Implementation**: `FPMChangeProvider.tsx` (1,501 lines)

### Key Findings

#### Current State

✅ **Already Implemented:**

- Database persistence via `ApiService`
- User session tracking with `userSessionId`
- Message sequence numbering
- LocalStorage fallback
- Server-side state sync
- Chat session initialization

❌ **Missing/Needs Update:**

- Some flowchart messages not matching WhatsApp script
- Emojis need to be removed (as per requirement)
- Some conversation branches may not be fully implemented
- Database schema might need updates for complete tracking

## Implementation Approach

### Phase 1: Message Audit & Alignment (Priority: HIGH)

**Goal**: Ensure all static messages match the flowchart and WhatsApp script, without emojis

**Tasks**:

1. Extract all unique messages from flowchart (3,000+ messages)
2. Extract all unique messages from WhatsApp script (1,758 messages)
3. Cross-reference with current `FPMChangeProvider.tsx` implementation
4. Identify gaps and mismatches
5. Remove all emojis from messages
6. Create message catalog

**Deliverables**:

- `changefpm-messages-catalog.json` - All messages organized by flow step
- `changefpm-gaps-analysis.md` - Missing or mismatched messages
- `changefpm-update-script.ts` - Automated update script

### Phase 2: Database Schema Validation (Priority: HIGH)

**Goal**: Ensure database can store all user choices, interactions, and sessions

**Current Schema Check**:

```prisma
// Check if these tables/fields exist and are sufficient:
- User sessions (user_session_id, chat_state, last_activity)
- Chat messages (content, timestamp, sender, sequence_number)
- User choices (choice_type, choice_value, step_id)
- Conversation context (current_method, satisfaction, switch_reason, etc.)
- FPM history (method_name, start_date, end_date, discontinuation_reason)
```

**Tasks**:

1. Review current Prisma schema
2. Identify missing fields for:
   - Current FPM method tracking
   - Satisfaction ratings
   - Switch reasons
   - Pregnancy intentions
   - Timing preferences
   - Side effects tracking
3. Create migration scripts if needed
4. Update API endpoints to handle new fields

**Deliverables**:

- `database-schema-updates.sql` - Required schema changes
- Updated Prisma schema
- Migration scripts
- Updated API endpoints

### Phase 3: Flow Implementation (Priority: MEDIUM)

**Goal**: Implement all conversation branches from the flowchart

**Key Flows to Verify/Implement**:

#### 3.1 Main Entry Points

- [ ] "I am dissatisfied with my current family planning method"
- [ ] Change FPM button from main menu
- [ ] Stop FPM button from main menu

#### 3.2 Current Method Detection

- [ ] IUD/IUS
- [ ] Implants (Jadelle, Implanon)
- [ ] Injections (Depo-Provera, Sayana Press)
- [ ] Daily Pill (Combined/Progestin-only)
- [ ] Female Sterilization
- [ ] Male Sterilization
- [ ] Condoms (Male/Female)
- [ ] Natural methods

#### 3.3 Satisfaction Assessment

- [ ] Very satisfied
- [ ] Satisfied
- [ ] Neutral
- [ ] Dissatisfied
- [ ] Very dissatisfied

#### 3.4 Reason for Change/Stop

- [ ] Side effects (weight gain, mood changes, bleeding, etc.)
- [ ] Ineffectiveness concerns
- [ ] Want to get pregnant
- [ ] Cost/accessibility issues
- [ ] Partner preference
- [ ] Health concerns
- [ ] Religious/cultural reasons

#### 3.5 Next Steps

- [ ] Switch to another method (show alternatives)
- [ ] Stop temporarily
- [ ] Stop permanently (want pregnancy)
- [ ] Consult healthcare provider
- [ ] Visit clinic

#### 3.6 Fertility Timeline Questions

For users wanting to get pregnant:

- [ ] How long since discontinuation?
  - Less than 1 month
  - 1-3 months
  - 3-6 months
  - 6-12 months
  - More than 1 year
- [ ] Method-specific timelines:
  - IUD: Immediate to 1-2 weeks
  - Implants: 1 week typically
  - Injections: 6-12 months
  - Pills: 1-3 months
  - Sterilization: Possibly reversible (requires surgery)

**Deliverables**:

- Updated `FPMChangeProvider.tsx` with all flows
- New widget configurations
- Flow testing scripts

### Phase 4: Message Updates (Priority: HIGH)

**Goal**: Update all messages to match flowchart and remove emojis

**Message Categories**:

#### 4.1 Entry Messages

```typescript
// BEFORE (with emoji):
"This is great! I am happy to give you advice on family planning. 😊";

// AFTER (no emoji):
"This is great! I am happy to give you advice on family planning.";
```

#### 4.2 Question Messages

```typescript
// Example from flowchart:
"Are you currently using a family planning method or did you recently use one?" -
  // Options:
  "Yes, I am currently using one" -
  "Yes, but I recently stopped" -
  "No, I have not used one recently";
```

#### 4.3 Method-Specific Removal Messages

```typescript
// IUD Removal:
"Visit the clinic where you adopted the method or a nearby clinic to remove it. Return to fertility happens immediately, or it can take 1-2 weeks. In most cases, you can become pregnant in the first cycle after removal.";

// Hausa translation:
"Ku ziyarci asibiti mafi kusa don cire IUD. Komawa ga haihuwa yana faruwa nan take, ko kuma yana iya ɗaukar sati ɗaya ko biyu. A mafi yawan lokuta, za ku iya yin ciki a farkon zagaye bayan cirewa.";
```

#### 4.4 Fertility Counseling Messages

Based on method and time since discontinuation

**Deliverables**:

- `messages-before-after.json` - All message changes
- Updated message files
- Language support (English/Hausa/Pidgin)

### Phase 5: Database Integration (Priority: HIGH)

**Goal**: Ensure every interaction is tracked in database

**Data Points to Track**:

#### 5.1 User Session Data

```typescript
interface UserFPMSession {
  user_session_id: string;
  current_fpm_method?: string;
  satisfaction_level?: string;
  switch_reason?: string[];
  wants_pregnancy?: boolean;
  pregnancy_timeline?: string;
  discontinuation_date?: Date;
  concerns?: string[];
  next_action?: string; // 'switch' | 'stop' | 'consult' | 'clinic'
}
```

#### 5.2 Interaction Tracking

```typescript
interface UserInteraction {
  interaction_id: string;
  user_session_id: string;
  interaction_type: "button_click" | "text_input" | "selection";
  step_id: string;
  choice_made: string;
  timestamp: Date;
  context: Record<string, any>;
}
```

#### 5.3 Chat History

```typescript
interface ChatMessage {
  message_id: string;
  user_session_id: string;
  sender: "bot" | "user" | "agent";
  content: string;
  message_type: "text" | "button" | "audio" | "video" | "document";
  step_id: string;
  sequence_number: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

**API Endpoints Needed**:

```typescript
// Save user choice
POST /api/chat/interaction
Body: { user_session_id, step_id, choice, context }

// Get user history
GET /api/chat/history/:user_session_id

// Save FPM context
POST /api/fpm/context
Body: { user_session_id, current_method, satisfaction, reasons, etc. }

// Get user's FPM journey
GET /api/fpm/journey/:user_session_id
```

**Deliverables**:

- Updated API service methods
- Database query functions
- Data persistence layer

### Phase 6: Testing & Validation (Priority: MEDIUM)

**Test Cases**:

#### 6.1 Flow Testing

- [ ] Test all entry points
- [ ] Test all method-specific flows
- [ ] Test all branching logic
- [ ] Test error handling
- [ ] Test fallback messages

#### 6.2 Data Persistence Testing

- [ ] Verify all choices are saved
- [ ] Verify session continuity
- [ ] Verify data retrieval
- [ ] Test cross-device sync
- [ ] Test offline behavior

#### 6.3 Message Accuracy Testing

- [ ] Compare all messages with flowchart
- [ ] Compare all messages with WhatsApp script
- [ ] Verify no emojis present
- [ ] Verify Hausa translations
- [ ] Verify button options

**Deliverables**:

- Test scripts
- Test results report
- Bug fixes

## Quick Wins (Can Implement Immediately)

### 1. Remove All Emojis from Current Messages

**File**: `FPMChangeProvider.tsx`
**Action**: Run regex replace to remove all emojis

```typescript
// Find: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
// Replace: (empty)
```

### 2. Add Missing Database Tracking

**File**: `FPMChangeProvider.tsx`
**Action**: Add `await this.api.saveInteraction()` after each user choice

### 3. Align Entry Message

**Current**:

```typescript
"This is great! 😊 I am happy to give you advice on family planning.";
```

**Update to (from flowchart)**:

```typescript
"This is great! I am happy to give you advice on family planning. Are you currently using a family planning method or did you recently use one?";
```

### 4. Add Method-Specific Timelines

From flowchart, add these as static responses:

**IUD/IUS**:

- "Visit the clinic where you adopted the method or a nearby clinic to remove it. Return to fertility happens immediately, or it can take 1-2 weeks."

**Implants**:

- "Visit a nearby clinic to remove the Implant. The earliest possible time to get pregnant is within 1 week of having the rod removed, but usually within 1 month."

**Injections**:

- "It usually takes several months for the complete effect of the hormones to disappear. In most cases, it's possible to become pregnant after 6 months."

**Pills**:

- "The pill stops your body from ovulating, but as soon as you stop taking the pill, your ovulation will start again. So, it's possible to get pregnant as soon as you stop the pill."

## Implementation Priority

### Sprint 1 (Week 1): Foundation

1. ✅ Remove all emojis from messages
2. ✅ Add interaction tracking to all choice points
3. ✅ Update entry message to match flowchart
4. ✅ Add method-specific fertility timelines

### Sprint 2 (Week 2): Database

1. Review and update database schema
2. Add missing fields for FPM tracking
3. Create migration scripts
4. Update API endpoints

### Sprint 3 (Week 3): Messages

1. Extract all messages from flowchart
2. Compare with current implementation
3. Update all mismatched messages
4. Add missing conversation branches

### Sprint 4 (Week 4): Testing

1. Create comprehensive test suite
2. Test all flows end-to-end
3. Verify data persistence
4. Fix bugs and edge cases

## Success Criteria

✅ **Complete when**:

1. All messages match flowchart (without emojis)
2. All messages match WhatsApp script
3. Every user interaction is saved to database
4. User can resume conversation from any device
5. All conversation branches are implemented
6. Method-specific information is accurate
7. Fertility timelines match medical guidelines
8. All tests pass
9. No console errors
10. Data persists across sessions

## Next Steps

**Immediate Action Items**:

1. Run emoji removal script on `FPMChangeProvider.tsx`
2. Add `this.api.saveInteraction()` calls
3. Update entry message
4. Add method-specific fertility messages
5. Review database schema
6. Create comprehensive test plan

**Resources Needed**:

- Access to production database for schema updates
- WhatsApp script reference for message validation
- Flowchart XML for complete flow mapping
- Medical consultation for fertility timeline accuracy

---

**This is a comprehensive plan. We should start with Quick Wins first, then tackle each phase systematically. Would you like me to begin implementing the Quick Wins now?**
