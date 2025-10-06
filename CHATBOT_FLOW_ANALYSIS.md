# Chatbot Flow Analysis & Improvements

## Date: October 6, 2025

## Analysis of Current Landbot vs Our Implementation

### ✅ Flow Comparison

#### 1. **Initial Greeting & Demographics (Lines 1-33)**

**Landbot Flow:**

```
1. Greeting: "Hey [Name]! My name is Honey..."
2. Gender selection
3. LGA input (text) → Confirmation (buttons)
4. Age selection
5. Marital status
6. "Thank you for sharing! Now I can assist you better"
7. Main menu
```

**Our Implementation:** ✅ **IMPROVED**

- More comprehensive demographic collection
- Server-side persistence (WhatsApp-style)
- Location search with fuzzy matching
- Better error handling
- Case-insensitive input handling

---

#### 2. **Main Menu Navigation (Lines 34-42)**

**Landbot:** Basic button options
**Ours:** ✅ **IMPROVED**

- Keyword navigation ("human", "agent", "clinic")
- Case-insensitive matching
- Better flow transitions
- Comprehensive conversation tracking

---

#### 3. **Prevent Pregnancy Flow (Lines 43-47)**

**Landbot:**

```
"What kind of contraception?"
- Emergency
- Prevent in future
```

**Ours:** ✅ **MATCHING + ENHANCED**

- Same options
- Added comprehensive tracking
- Better product information
- Media widgets (audio/images)

---

### 🔧 Required Improvements

#### 1. **Case-Insensitive Input Handling**

**Status:** ⚠️ NEEDS ENHANCEMENT

**Problem Areas:**

- MessageParser uses `toLowerCase()` but some handlers don't
- Widget button clicks bypass MessageParser
- Direct method calls are case-sensitive

**Solution:** Add universal input normalization

---

#### 2. **Human Input Diversity**

**Status:** ⚠️ NEEDS ENHANCEMENT

**Problem:** Users might type:

- "no" instead of clicking buttons
- Variations: "nope", "nah", "not now"
- Partial matches: "emergenc" for "emergency"
- Typos: "pregnanct", "contracepton"

**Solution:**

- Add fuzzy matching
- Add intent recognition
- Better fallback handling

---

#### 3. **Clinic Recommendation**

**Status:** ⚠️ NEEDS VERIFICATION

**Current Implementation:**

- Location-based search
- Distance calculation
- Detailed clinic information

**Improvements Needed:**

- Test with real data
- Add backup options if no nearby clinics
- Better error messages

---

#### 4. **Redundant Files to Remove**

**Identified Redundant Files:**

1. ✅ **Already Fixed:**

   - `types.ts` in preventPregnancy (cleaned up)

2. ❌ **To Remove:**

   - `preventPregnancyTypes.tsx` - Duplicate of `preventPregnancyTypes.ts`
   - `FPMChangeProvider copy.tsx` - Backup file
   - `MessageParser copy.ts` - Backup file
   - `App-backup.tsx` - Backup file
   - `App-NEW.tsx` - Backup file
   - `preventPregnancyActionProvider.tsx.broken` - Broken backup
   - `chatscript.txt` - Can move to docs folder after analysis

3. ⚠️ **Inconsistent Type Definitions:**
   - `preventPregnancyTypes.ts` - Main type file
   - `preventPregnancyTypes.tsx` - Smaller duplicate (REMOVE)
   - `types.ts` - Just cleaned, keep
   - Need to consolidate

---

### 📋 Implementation Plan

#### Phase 1: Input Handling Enhancement ⭐ PRIORITY

**File:** `MessageParser.ts`

Add:

```typescript
private normalizeInput(input: string): string {
  return input.toLowerCase().trim();
}

private fuzzyMatch(input: string, options: string[]): string | null {
  const normalized = this.normalizeInput(input);

  // Exact match
  const exactMatch = options.find(opt =>
    opt.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;

  // Partial match
  const partialMatch = options.find(opt =>
    opt.toLowerCase().includes(normalized) ||
    normalized.includes(opt.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // Levenshtein distance for typos
  // ... implement

  return null;
}
```

---

#### Phase 2: Intent Recognition

Add common variations:

```typescript
const INTENT_MAPPINGS = {
  emergency: ["emergency", "emergenc", "urgent", "now", "asap"],
  prevent: ["prevent", "future", "later", "plan ahead"],
  negative: ["no", "nope", "nah", "not now", "skip", "pass"],
  positive: ["yes", "yeah", "yep", "sure", "ok", "okay"],
  human: ["human", "agent", "person", "talk to someone", "real person"],
  clinic: ["clinic", "location", "near me", "nearby", "find clinic"],
};
```

---

#### Phase 3: Enhanced Fallback Messages

```typescript
private handleUnrecognizedInput(step: ChatStep): void {
  const fallbackMessages = {
    contraception: "I didn't catch that. Please choose 'Emergency' if you need contraception now, or 'Prevent in future' if you're planning ahead.",
    fpm: "I'm not sure what you mean. Please click one of the buttons above, or type 'help' to learn more.",
    // ... more specific fallbacks
  };

  const message = fallbackMessages[step] ||
    "Sorry, I didn't understand. Could you please choose from the options above?";

  this.actionProvider.createChatBotMessage(message);
}
```

---

### 🗑️ Files to Remove

**Backup Files:**

```
❌ src/chatbot/sections/changeFPM/FPMChangeProvider copy.tsx
❌ src/chatbot/MessageParser copy.ts
❌ src/App-backup.tsx
❌ src/App-NEW.tsx
❌ src/chatbot/sections/preventPregnancy/preventPregnancyActionProvider.tsx.broken
```

**Redundant Type Files:**

```
❌ src/chatbot/sections/preventPregnancy/preventPregnancyTypes.tsx
   (Keep preventPregnancyTypes.ts instead)
```

**Documentation:**

```
→ Move chatscript.txt to docs/ folder (for reference)
```

---

### 🎯 Chatbot Flow Verification

#### ✅ Demographics Flow

- [x] Initial greeting with name
- [x] Gender selection
- [x] Location input → LGA confirmation
- [x] Age selection
- [x] Marital status
- [x] Thank you message
- [x] Server-side persistence

#### ✅ Main Navigation

- [x] Clear FPM explanation
- [x] 5 main options (Get pregnant, Prevent, Improve sex, Change/Stop, Ask question)
- [x] Keyword shortcuts

#### ✅ Prevent Pregnancy Flow

- [x] Emergency vs Future choice
- [x] Emergency products (Postpill, Postinor2)
- [x] Duration-based method selection
- [x] Detailed method information
- [x] Audio/video options
- [x] Clinic referral

#### ✅ Get Pregnant Flow

- [x] FPM status check
- [x] Method-specific guidance
- [x] Trying duration tracking
- [x] Next action options

#### ✅ Change/Stop FPM Flow

- [x] Current method selection
- [x] Concern type identification
- [x] Switch/Stop/Concerned paths
- [x] Satisfaction assessment
- [x] Recommendation engine

#### ⚠️ Needs Enhancement

- [ ] Better typo handling
- [ ] More natural language understanding
- [ ] Stronger fallback messages
- [ ] Intent-based routing

---

### 📊 Comparison Summary

| Feature            | Landbot      | Our Implementation         | Status     |
| ------------------ | ------------ | -------------------------- | ---------- |
| Demographics       | Basic        | Comprehensive + Persistent | ✅ Better  |
| Case Handling      | Unknown      | Partial                    | ⚠️ Improve |
| Flow Logic         | Simple       | Complex + Tracked          | ✅ Better  |
| Error Handling     | Basic        | Comprehensive              | ✅ Better  |
| Persistence        | Session only | Server + Local             | ✅ Better  |
| Clinic Search      | Basic        | Advanced (needs testing)   | ⚠️ Verify  |
| Media Support      | Limited      | Extensive                  | ✅ Better  |
| Analytics          | Unknown      | Complete tracking          | ✅ Better  |
| Typo Tolerance     | Unknown      | None                       | ❌ Add     |
| Intent Recognition | Unknown      | None                       | ❌ Add     |

---

### 🚀 Next Steps

1. **Immediate (Today):**

   - Remove redundant backup files
   - Add case-insensitive input normalization
   - Add common input variations

2. **Short Term (This Week):**

   - Implement fuzzy matching
   - Add intent recognition
   - Test clinic recommendation with real data
   - Add better fallback messages

3. **Medium Term:**
   - A/B test conversation flows
   - Gather user feedback
   - Refine recommendation algorithms

---

### 🎉 Summary

**Our chatbot is BETTER than the Landbot version in:**

- ✅ Persistence and state management
- ✅ Comprehensive tracking and analytics
- ✅ Error handling
- ✅ Media integration
- ✅ Complex flow management
- ✅ Server-side architecture

**Areas needing improvement:**

- ⚠️ Natural language understanding
- ⚠️ Typo tolerance
- ⚠️ Intent recognition
- ⚠️ Clinic recommendation testing

**Overall Assessment:** Our implementation is significantly more robust and feature-rich. With the planned enhancements, it will be vastly superior to the Landbot version.
