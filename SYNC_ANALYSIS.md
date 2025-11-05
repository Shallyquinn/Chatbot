# Chatbot Sync Analysis Report

## Files Missing in Yoruba Chatbot

### Utils folder (NO translation needed - pure logic):

- ✅ COPIED: utils/ConfusionDetector.ts
- ✅ COPIED: utils/MessageFormatter.ts
- ✅ COPIED: utils/SmartMessageTimer.ts

### Sections folder:

- ✅ COPIED: sections/sexEnhancement/sexEnhancementActionProvider.tsx (NEEDS translation)
- ✅ COPIED: sections/preventPregnancy/contraceptiveMethods.ts (data file)
- ✅ COPIED: sections/preventPregnancy/productData.ts (data file)

### Missing preventPregnancy files:

- sections/preventPregnancy/messages.ts
- sections/preventPregnancy/types.ts

---

## Files Missing in Hausa Chatbot

### Utils folder (NO translation needed):

- ✅ COPIED: utils/ConfusionDetector.ts
- ✅ COPIED: utils/MessageFormatter.ts
- ✅ COPIED: utils/SmartMessageTimer.ts

### Sections folder:

- ✅ COPIED: sections/sexEnhancement/sexEnhancementActionProvider.tsx (NEEDS translation)
- ✅ COPIED: sections/preventPregnancy/productData.ts (data file)

---

## Updated Files (Structure changes - logic added):

### Core files that need careful merge:

1. **ActionProvider.tsx**
   - English: 3297 lines
   - Yoruba: 1034 lines (2263 lines behind!)
   - Hausa: 2167 lines (1130 lines behind!)
2. **config.tsx**
   - Needs widget updates
3. **MessageParser.ts**
   - Needs new command parsing logic

---

## Recommendation

Given the massive differences (especially in ActionProvider), here's the safest approach:

### Option A: Full Sync (Recommended)

1. Copy ALL English files to Yoruba/Hausa
2. Use the backup translations to re-translate messages
3. Benefit: Get ALL new features immediately

### Option B: Manual Merge (Time-consuming)

1. Manually compare each file
2. Copy logic but keep translated strings
3. Risk: Easy to miss updates

### Option C: Hybrid Approach (What I'll do)

1. Copy non-translatable files (utils, types, data files) ✅ DONE
2. For each major file (ActionProvider, config):
   - Extract your translated messages to a JSON file
   - Copy the English version
   - Create a TODO list of where to insert translations

---

## Next Steps

Please confirm which approach you prefer:

- Type "A" for full sync (fastest, requires re-translation)
- Type "B" for manual merge guidance (slowest, safest for translations)
- Type "C" for hybrid (I extract translations, copy structure, give you TODO list)
