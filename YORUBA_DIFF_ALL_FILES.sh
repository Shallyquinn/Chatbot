#!/bin/bash
# Individual Diff Commands for Yoruba Chatbot Files
# Comparing: yoruba-backup/yoruba-chatbot vs honey/src/yoruba-chatbot

cd "/c/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot"

echo "=========================================="
echo "INDIVIDUAL FILE DIFF COMMANDS"
echo "=========================================="
echo ""

# ROOT LEVEL FILES
echo "# 1. ActionProvider.tsx"
diff -u "yoruba-backup/yoruba-chatbot/ActionProvider.tsx" "honey/src/yoruba-chatbot/ActionProvider.tsx"
echo ""

echo "# 2. ActionProviderWrapper.tsx"
diff -u "yoruba-backup/yoruba-chatbot/ActionProviderWrapper.tsx" "honey/src/yoruba-chatbot/ActionProviderWrapper.tsx"
echo ""

echo "# 3. config.tsx"
diff -u "yoruba-backup/yoruba-chatbot/config.tsx" "honey/src/yoruba-chatbot/config.tsx"
echo ""

echo "# 4. MessageParser.ts"
diff -u "yoruba-backup/yoruba-chatbot/MessageParser.ts" "honey/src/yoruba-chatbot/MessageParser.ts"
echo ""

echo "# 5. MessageParser copy.ts"
diff -u "yoruba-backup/yoruba-chatbot/MessageParser copy.ts" "honey/src/yoruba-chatbot/MessageParser copy.ts"
echo ""

echo "# 6. MessageParserWrapper.tsx"
diff -u "yoruba-backup/yoruba-chatbot/MessageParserWrapper.tsx" "honey/src/yoruba-chatbot/MessageParserWrapper.tsx"
echo ""

echo "# 7. types.ts"
diff -u "yoruba-backup/yoruba-chatbot/types.ts" "honey/src/yoruba-chatbot/types.ts"
echo ""

# CHANGE FPM SECTION
echo "=========================================="
echo "CHANGE FPM SECTION"
echo "=========================================="
echo ""

echo "# 8. sections/changeFPM/FPMChangeProvider.tsx"
diff -u "yoruba-backup/yoruba-chatbot/sections/changeFPM/FPMChangeProvider.tsx" "honey/src/yoruba-chatbot/sections/changeFPM/FPMChangeProvider.tsx"
echo ""

echo "# 9. sections/changeFPM/FPMChangeProvider copy.tsx"
diff -u "yoruba-backup/yoruba-chatbot/sections/changeFPM/FPMChangeProvider copy.tsx" "honey/src/yoruba-chatbot/sections/changeFPM/FPMChangeProvider copy.tsx"
echo ""

echo "# 10. sections/changeFPM/fpmResponses.ts"
diff -u "yoruba-backup/yoruba-chatbot/sections/changeFPM/fpmResponses.ts" "honey/src/yoruba-chatbot/sections/changeFPM/fpmResponses.ts"
echo ""

echo "# 11. sections/changeFPM/fpmTypes.ts"
diff -u "yoruba-backup/yoruba-chatbot/sections/changeFPM/fpmTypes.ts" "honey/src/yoruba-chatbot/sections/changeFPM/fpmTypes.ts"
echo ""

echo "# 12. sections/changeFPM/fpmWidgetsConfig.tsx"
diff -u "yoruba-backup/yoruba-chatbot/sections/changeFPM/fpmWidgetsConfig.tsx" "honey/src/yoruba-chatbot/sections/changeFPM/fpmWidgetsConfig.tsx"
echo ""

# GET PREGNANT SECTION
echo "=========================================="
echo "GET PREGNANT SECTION"
echo "=========================================="
echo ""

echo "# 13. sections/getPregnant/getPregnantActionProvider.tsx"
diff -u "yoruba-backup/yoruba-chatbot/sections/getPregnant/getPregnantActionProvider.tsx" "honey/src/yoruba-chatbot/sections/getPregnant/getPregnantActionProvider.tsx"
echo ""

echo "# 14. sections/getPregnant/getPregnantConfig.tsx"
diff -u "yoruba-backup/yoruba-chatbot/sections/getPregnant/getPregnantConfig.tsx" "honey/src/yoruba-chatbot/sections/getPregnant/getPregnantConfig.tsx"
echo ""

echo "# 15. sections/getPregnant/index.ts"
diff -u "yoruba-backup/yoruba-chatbot/sections/getPregnant/index.ts" "honey/src/yoruba-chatbot/sections/getPregnant/index.ts"
echo ""

# PREVENT PREGNANCY SECTION
echo "=========================================="
echo "PREVENT PREGNANCY SECTION"
echo "=========================================="
echo ""

echo "# 16. sections/preventPregnancy/contraceptiveMethods.ts"
diff -u "yoruba-backup/yoruba-chatbot/sections/preventPregnancy/contraceptiveMethods.ts" "honey/src/yoruba-chatbot/sections/preventPregnancy/contraceptiveMethods.ts"
echo ""

echo "# 17. sections/preventPregnancy/index.ts"
diff -u "yoruba-backup/yoruba-chatbot/sections/preventPregnancy/index.ts" "honey/src/yoruba-chatbot/sections/preventPregnancy/index.ts"
echo ""

echo "# 18. sections/preventPregnancy/preventPregnancyActionProvider.tsx"
diff -u "yoruba-backup/yoruba-chatbot/sections/preventPregnancy/preventPregnancyActionProvider.tsx" "honey/src/yoruba-chatbot/sections/preventPregnancy/preventPregnancyActionProvider.tsx"
echo ""

echo "# 19. sections/preventPregnancy/preventPregnancyTypes.ts"
diff -u "yoruba-backup/yoruba-chatbot/sections/preventPregnancy/preventPregnancyTypes.ts" "honey/src/yoruba-chatbot/sections/preventPregnancy/preventPregnancyTypes.ts"
echo ""

echo "# 20. sections/preventPregnancy/preventPregnancyWidgetsConfig.tsx"
diff -u "yoruba-backup/yoruba-chatbot/sections/preventPregnancy/preventPregnancyWidgetsConfig.tsx" "honey/src/yoruba-chatbot/sections/preventPregnancy/preventPregnancyWidgetsConfig.tsx"
echo ""

echo "# 21. sections/preventPregnancy/productData.ts"
diff -u "yoruba-backup/yoruba-chatbot/sections/preventPregnancy/productData.ts" "honey/src/yoruba-chatbot/sections/preventPregnancy/productData.ts"
echo ""

# SEX ENHANCEMENT SECTION
echo "=========================================="
echo "SEX ENHANCEMENT SECTION"
echo "=========================================="
echo ""

echo "# 22. sections/sexEnhancement/sexEnhancementActionProvider.tsx"
diff -u "yoruba-backup/yoruba-chatbot/sections/sexEnhancement/sexEnhancementActionProvider.tsx" "honey/src/yoruba-chatbot/sections/sexEnhancement/sexEnhancementActionProvider.tsx"
echo ""

# UTILS SECTION
echo "=========================================="
echo "UTILS SECTION"
echo "=========================================="
echo ""

echo "# 23. utils/ConfusionDetector.ts"
diff -u "yoruba-backup/yoruba-chatbot/utils/ConfusionDetector.ts" "honey/src/yoruba-chatbot/utils/ConfusionDetector.ts"
echo ""

echo "# 24. utils/MessageFormatter.ts"
diff -u "yoruba-backup/yoruba-chatbot/utils/MessageFormatter.ts" "honey/src/yoruba-chatbot/utils/MessageFormatter.ts"
echo ""

echo "# 25. utils/SmartMessageTimer.ts"
diff -u "yoruba-backup/yoruba-chatbot/utils/SmartMessageTimer.ts" "honey/src/yoruba-chatbot/utils/SmartMessageTimer.ts"
echo ""

# FILES ONLY IN HONEY (NOT IN BACKUP)
echo "=========================================="
echo "FILES ONLY IN HONEY (NOT IN BACKUP)"
echo "=========================================="
echo ""

echo "# 26. sections/preventPregnancy/messages.ts (NEW IN HONEY)"
cat "honey/src/yoruba-chatbot/sections/preventPregnancy/messages.ts"
echo ""

echo "# 27. sections/preventPregnancy/types.ts (NEW IN HONEY)"
cat "honey/src/yoruba-chatbot/sections/preventPregnancy/types.ts"
echo ""

echo "=========================================="
echo "SUMMARY COMPLETED"
echo "=========================================="
