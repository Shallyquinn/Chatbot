# Translation Restoration Guide

## Overview
Your original Yoruba and Hausa translations are now extracted to:
- `yoruba-backup/yoruba-chatbot/` - Original Yoruba translations
- `hausa-backup/hausa-chatbot/` - Original Hausa translations

The current live versions in `honey/src/yoruba-chatbot/` and `honey/src/hausa-chatbot/` now have:
✅ All latest features (3297 lines vs old 1034/2167 lines)
✅ Smart message timing, confusion detection, storage persistence
✅ All sections (sex enhancement, updated pregnancy prevention)
⚠️ English messages (need to be replaced with your translations)

## Translation Workflow - Hybrid Smart Approach

### Step 1: Identify What Needs Translation

**Priority Files** (contain user-facing messages):
1. `ActionProvider.tsx` - Main conversation logic and messages (MOST IMPORTANT)
2. `config.tsx` - Initial greeting messages
3. `sections/*/messages.ts` - Section-specific messages

**Files that DON'T need translation** (pure logic):
- `MessageParser.ts` - Just routes messages, no user-facing text
- `types.ts` - Type definitions only
- `utils/*.ts` - Pure logic files (ConfusionDetector, MessageFormatter, SmartMessageTimer)
- `sections/preventPregnancy/contraceptiveMethods.ts` - Product data (keep English or translate product names)
- `sections/preventPregnancy/productData.ts` - Product specifications (keep English or translate)

### Step 2: Use VS Code's Compare Feature

For each language (Yoruba/Hausa), compare files side-by-side:

**For Yoruba:**
```bash
# Open VS Code comparison
code --diff "C:/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot/yoruba-backup/yoruba-chatbot/ActionProvider.tsx" "C:/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot/honey/src/yoruba-chatbot/ActionProvider.tsx"
```

**For Hausa:**
```bash
# Open VS Code comparison
code --diff "C:/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot/hausa-backup/hausa-chatbot/ActionProvider.tsx" "C:/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot/honey/src/hausa-chatbot/ActionProvider.tsx"
```

### Step 3: Translation Strategy

**Option A: Manual Copy-Paste (Recommended for accuracy)**
1. Open backup file (LEFT side of comparison)
2. Open current file (RIGHT side - the one you'll edit)
3. For each English message in the current file, find the corresponding translated message in the backup
4. Copy the translated message from backup and replace the English message

**Option B: Semi-Automated with Script**
I've created a helper script `compare-translations.py` that:
- Extracts all string messages from both versions
- Shows you side-by-side comparison
- Helps identify which strings need translation

### Step 4: Files to Translate (Priority Order)

#### CRITICAL (Do First):
1. **config.tsx**
   - Initial bot greeting
   - Welcome messages
   - Widget button text
   
2. **ActionProvider.tsx**
   - All `createChatBotMessage()` calls
   - Button text in widgets
   - Response messages in all handlers

#### IMPORTANT (Do Next):
3. **sections/changeFPM/messages.ts** (if exists in backup)
4. **sections/getPregnant/messages.ts** (if exists in backup)
5. **sections/preventPregnancy/messages.ts** (new file, translate from English)
6. **sections/sexEnhancement/sexEnhancementActionProvider.tsx** (new file, translate from English)

#### OPTIONAL (Low Priority):
7. Product names in `contraceptiveMethods.ts` and `productData.ts`
8. Error messages and technical strings

### Step 5: What to Look For in ActionProvider.tsx

Search for these patterns in the English version and replace with translations:

**Pattern 1: Simple messages**
```typescript
// ENGLISH (current - needs translation)
const message = createChatBotMessage("Hello! How can I help you?");

// YORUBA (from backup)
const message = createChatBotMessage("Pẹlẹ o! Bawo ni mo ṣe le ran yin lọwọ?");

// HAUSA (from backup)
const message = createChatBotMessage("Sannu! Ta yaya zan iya taimaka maka?");
```

**Pattern 2: Multi-line messages**
```typescript
// ENGLISH
const message = createChatBotMessage(
  "Welcome to our service.\nHow may I assist you today?"
);

// Find equivalent in backup and replace
```

**Pattern 3: Button text in widgets**
```typescript
// ENGLISH
<Button onClick={...}>Continue</Button>

// YORUBA
<Button onClick={...}>Tẹsiwaju</Button>

// HAUSA
<Button onClick={...}>Ci gaba</Button>
```

### Step 6: Testing Your Translations

After translating each file:
1. Save the file
2. Check for TypeScript errors in VS Code
3. Test in browser: `http://localhost:5173/chat/yoruba` or `/chat/hausa`
4. Verify messages display correctly
5. Test full conversation flow

### Step 7: Commit Translations Incrementally

Don't wait to translate everything! Commit after each file:

```bash
# After translating config.tsx
git add honey/src/yoruba-chatbot/config.tsx
git commit -m "feat: Restore Yoruba translations for config.tsx"
git push

# After translating ActionProvider.tsx (biggest file)
git add honey/src/yoruba-chatbot/ActionProvider.tsx
git commit -m "feat: Restore Yoruba translations for ActionProvider.tsx"
git push

# Repeat for Hausa and other files
```

## Quick Start Commands

### 1. Extract backups (ALREADY DONE ✅)
```bash
cd "C:/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot"
tar -xzf yoruba-chatbot-backup.tar.gz -C yoruba-backup/
tar -xzf hausa-chatbot-backup.tar.gz -C hausa-backup/
```

### 2. Compare files side-by-side
```bash
# Compare Yoruba ActionProvider
code --diff "yoruba-backup/yoruba-chatbot/ActionProvider.tsx" "honey/src/yoruba-chatbot/ActionProvider.tsx"

# Compare Hausa ActionProvider
code --diff "hausa-backup/hausa-chatbot/ActionProvider.tsx" "honey/src/hausa-chatbot/ActionProvider.tsx"

# Compare configs
code --diff "yoruba-backup/yoruba-chatbot/config.tsx" "honey/src/yoruba-chatbot/config.tsx"
code --diff "hausa-backup/hausa-chatbot/config.tsx" "honey/src/hausa-chatbot/config.tsx"
```

### 3. Check what's in backups
```bash
# List Yoruba backup files
ls -la yoruba-backup/yoruba-chatbot/

# List Hausa backup files
ls -la hausa-backup/hausa-chatbot/

# View backup structure
tree yoruba-backup/yoruba-chatbot/ -L 2
tree hausa-backup/hausa-chatbot/ -L 2
```

## Translation Tips

### DO:
✅ Copy translated messages exactly as they appear in backup
✅ Preserve formatting (line breaks, punctuation)
✅ Keep all variable names and code structure unchanged
✅ Test after each file translation
✅ Commit frequently (file-by-file is fine)
✅ Focus on user-facing messages first

### DON'T:
❌ Translate variable names or function names
❌ Modify code logic or structure
❌ Translate TypeScript types or interfaces
❌ Change import/export statements
❌ Translate technical error messages (optional, low priority)
❌ Try to translate everything at once (do it incrementally!)

## Estimated Time

- **config.tsx**: 5-10 minutes per language
- **ActionProvider.tsx**: 1-2 hours per language (it's big!)
- **Section messages**: 15-30 minutes per section per language
- **Total**: 3-5 hours per language (do Yoruba first, then Hausa)

## Need Help?

If you get stuck:
1. Check TypeScript errors in VS Code (bottom panel)
2. Compare the backup file structure with current file
3. Ask me to help with specific sections or error messages
4. Use `git diff` to see what changed

## Files Currently Available

**Yoruba Backup** (extracted to `yoruba-backup/yoruba-chatbot/`):
- ActionProvider.tsx (1034 lines - OLD but has YOUR translations)
- config.tsx (has Yoruba greeting messages)
- MessageParser.ts
- types.ts
- sections/ (changeFPM, getPregnant, preventPregnancy folders)

**Hausa Backup** (extracted to `hausa-backup/hausa-chatbot/`):
- ActionProvider.tsx (2167 lines - OLD but has YOUR translations)
- config-hausa-backup.tsx (has Hausa greeting messages)
- MessageParser.ts
- types.ts
- sections/ (changeFPM, getPregnant, preventPregnancy folders)

**Current Live Versions** (in `honey/src/yoruba-chatbot/` and `honey/src/hausa-chatbot/`):
- ActionProvider.tsx (3297 lines - NEW structure, English messages)
- config.tsx (English messages)
- All sections including NEW sexEnhancement
- All NEW utility files (ConfusionDetector, MessageFormatter, SmartMessageTimer)

Your job: Copy translations from backup files → paste into current files, keeping the new structure intact!
