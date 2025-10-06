#!/bin/bash
# Quick setup verification for Chat State Sessions

echo "🔍 Chat State Sessions Setup Verification"
echo "========================================"

# Check if database table exists
echo "1. Checking database table..."
if command -v psql &> /dev/null; then
    echo "   PostgreSQL CLI found - checking table..."
    # You can customize this with your database connection details
    # psql -d your_database -c "\dt chat_state_sessions"
else
    echo "   ⚠️  PostgreSQL CLI not found - manual check needed"
fi

# Check if TypeScript files exist
echo -e "\n2. Checking implementation files..."
files=(
    "src/chat-state-sessions/chat-state-sessions.controller.ts"
    "src/chat-sessions/chat-sessions.service.ts"
    "src/chat-state-sessions/dto/create-chat-state-session.dto.ts"
    "src/chat-state-sessions/dto/update-chat-state-session.dto.ts"
    "prisma/schema.prisma"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done

# Check if module is imported in app.module.ts
echo -e "\n3. Checking app.module.ts imports..."
if grep -q "ChatStateSessionsController" src/app.module.ts; then
    echo "   ✅ ChatStateSessionsController imported"
else
    echo "   ❌ ChatStateSessionsController not imported in app.module.ts"
fi

# Try to build the project
echo -e "\n4. Testing TypeScript compilation..."
if npm run build &> /dev/null; then
    echo "   ✅ TypeScript compilation successful"
else
    echo "   ❌ TypeScript compilation failed - check for errors"
    echo "      Run: npm run build"
fi

echo -e "\n📋 Next Steps:"
echo "1. Run the manual SQL migration if not done:"
echo "   psql -d your_database -f prisma/migrations/manual_add_chat_state_sessions.sql"
echo ""
echo "2. Start the server:"
echo "   npm run start:dev"
echo ""
echo "3. Test the endpoints:"
echo "   node test-chat-state-sessions.js"
echo ""
echo "4. Check server logs for any errors during startup"
