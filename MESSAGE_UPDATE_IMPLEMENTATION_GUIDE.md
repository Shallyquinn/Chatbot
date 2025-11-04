
# MESSAGE UPDATE IMPLEMENTATION GUIDE

## Overview
This guide helps you add 50 missing messages to FPMChangeProvider.tsx

## Categories Found

### General Question
- **Count**: 8 messages
- **Priority**: MEDIUM
- **Handler**: `handleGeneralQuestion`
- **Widget Type**: buttons

### Instruction
- **Count**: 2 messages
- **Priority**: LOW
- **Handler**: `sendInstructionMessage`
- **Widget Type**: text

### General Info
- **Count**: 23 messages
- **Priority**: LOW
- **Handler**: `sendGeneralMessage`
- **Widget Type**: text

### Method Info
- **Count**: 2 messages
- **Priority**: MEDIUM
- **Handler**: `getMethodAdvantagesDisadvantages`
- **Widget Type**: text

### Eligibility Info
- **Count**: 2 messages
- **Priority**: HIGH
- **Handler**: `getMethodEligibility`
- **Widget Type**: text

### Demographic Question
- **Count**: 1 messages
- **Priority**: MEDIUM
- **Handler**: `handleDemographicQuestion`
- **Widget Type**: list

### Stop Switch Question
- **Count**: 1 messages
- **Priority**: HIGH
- **Handler**: `handleStopSwitchQuestion`
- **Widget Type**: buttons

### Side Effect Question
- **Count**: 1 messages
- **Priority**: HIGH
- **Handler**: `handleSideEffectQuestion`
- **Widget Type**: list

### Fertility Info
- **Count**: 10 messages
- **Priority**: HIGH
- **Handler**: `getFertilityTimelineMessage`
- **Widget Type**: text


## Implementation Steps

### Step 1: Add Message Constants
Copy the generated constants from `generated-message-constants.ts` to the top of `FPMChangeProvider.tsx`

### Step 2: Add Handler Methods
Copy the generated handler methods from `generated-handler-methods.ts` into the `FPMChangeProvider` class

### Step 3: Update Widget Configuration
Add the widget configurations from `generated-widget-config.ts` to your widgets file

### Step 4: Update Flow Logic
Connect the new handlers to your flow logic:

```typescript
// In your flow switch/case or routing logic
case 'side_effect_question':
  await this.handleSideEffectQuestionMessages(context);
  break;

case 'fertility_info':
  // Use existing getFertilityTimelineMessage or enhance it
  await this.sendFertilityInfo(method);
  break;

// ... add other cases
```

### Step 5: Test Each Category
Test each message category:
1. Side effect questions
2. Fertility information
3. Stop/Switch questions
4. Method information
5. Demographic questions
6. Instructions

### Step 6: Update Database Tracking
Ensure FpmInteraction tracking includes the new `fpm_flow_type` values:
- 'side_effect_question'
- 'fertility_info'
- 'stop_switch_question'
- 'method_info'
- 'eligibility_info'
- 'demographic_question'

## Testing Checklist
- [ ] Messages display correctly in all 3 languages
- [ ] Widgets appear with correct options
- [ ] User selections are tracked in database
- [ ] Flow logic routes correctly
- [ ] No emojis appear in messages
- [ ] Multilingual switching works
- [ ] All 50+ gaps are filled

## Database Tracking
All new message flows should create FpmInteraction records:

```typescript
await this.api.createFpmInteraction({
  fpm_flow_type: '<category_name>',
  current_fpm_method: this.state.currentFPMMethod,
  // Add other relevant fields based on context
});
```
