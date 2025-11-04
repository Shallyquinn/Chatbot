"""
Task 2: Automated Message Update Script
Generates TypeScript code to add missing messages from flowchart to FPMChangeProvider
"""

import json
import re
from typing import List, Dict

def load_catalog():
    """Load the message catalog"""
    with open('changefpm-messages-catalog.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_english_hausa_yoruba(message: str) -> Dict[str, str]:
    """
    Split multilingual messages into English, Hausa, and Yoruba
    Patterns:
    - "English text Hausa text" (space separated)
    - "English textHausa text" (no space)
    - Sometimes Yoruba included
    """
    # Clean the message
    message = message.strip()
    
    # If it's purely English (no multilingual)
    if not any(word in message.lower() for word in ['ina', 'kuna', 'ku', 'ki', 'da', 'ba', 'don', 'yana', 'se', 'mo', 'ti', 'ni', 'o', 'tabi', 'fun']):
        return {
            'english': message,
            'hausa': '',
            'yoruba': ''
        }
    
    # Try to split by common patterns
    # Pattern 1: Question mark or period separating English and Hausa
    if '?' in message and message.count('?') == 2:
        parts = message.split('?')
        return {
            'english': parts[0].strip() + '?',
            'hausa': parts[1].strip() + '?' if len(parts) > 1 else '',
            'yoruba': parts[2].strip() if len(parts) > 2 else ''
        }
    
    # Pattern 2: Capital letter followed by lowercase (start of Hausa/Yoruba)
    # Look for pattern where English ends and Hausa/Yoruba starts
    matches = list(re.finditer(r'([A-Z][a-z]+)', message))
    
    if len(matches) >= 2:
        # Assume first match is English, second is Hausa
        english_end = matches[1].start()
        return {
            'english': message[:english_end].strip(),
            'hausa': message[english_end:].strip(),
            'yoruba': ''
        }
    
    # Default: return as English
    return {
        'english': message,
        'hausa': '',
        'yoruba': ''
    }

def categorize_message(message: str) -> Dict[str, any]:
    """Categorize a message and determine where it should be added"""
    msg_lower = message.lower()
    
    # Questions
    if '?' in message:
        if 'side effect' in msg_lower or 'concern' in msg_lower:
            return {
                'category': 'side_effect_question',
                'handler': 'handleSideEffectQuestion',
                'widget_type': 'list',
                'priority': 'HIGH'
            }
        elif 'stop' in msg_lower or 'switch' in msg_lower:
            return {
                'category': 'stop_switch_question',
                'handler': 'handleStopSwitchQuestion',
                'widget_type': 'buttons',
                'priority': 'HIGH'
            }
        elif 'marital status' in msg_lower or 'age' in msg_lower:
            return {
                'category': 'demographic_question',
                'handler': 'handleDemographicQuestion',
                'widget_type': 'list',
                'priority': 'MEDIUM'
            }
        else:
            return {
                'category': 'general_question',
                'handler': 'handleGeneralQuestion',
                'widget_type': 'buttons',
                'priority': 'MEDIUM'
            }
    
    # Fertility information
    if any(word in msg_lower for word in ['pregnant', 'fertility', 'return to fertility', 'ciki', 'oyun']):
        return {
            'category': 'fertility_info',
            'handler': 'getFertilityTimelineMessage',
            'widget_type': 'text',
            'priority': 'HIGH'
        }
    
    # Method advantages/disadvantages
    if any(word in msg_lower for word in ['advantage', 'disadvantage', 'fa\'ida', 'aleebu']):
        return {
            'category': 'method_info',
            'handler': 'getMethodAdvantagesDisadvantages',
            'widget_type': 'text',
            'priority': 'MEDIUM'
        }
    
    # Who can use
    if 'who can use' in msg_lower or 'who cannot use' in msg_lower:
        return {
            'category': 'eligibility_info',
            'handler': 'getMethodEligibility',
            'widget_type': 'text',
            'priority': 'HIGH'
        }
    
    # Instructions
    if any(word in msg_lower for word in ['visit', 'call', 'click', 'watch']):
        return {
            'category': 'instruction',
            'handler': 'sendInstructionMessage',
            'widget_type': 'text',
            'priority': 'LOW'
        }
    
    # Default
    return {
        'category': 'general_info',
        'handler': 'sendGeneralMessage',
        'widget_type': 'text',
        'priority': 'LOW'
    }

def generate_typescript_constant(message: str, index: int, category_info: Dict) -> str:
    """Generate TypeScript constant for a message"""
    lang_parts = extract_english_hausa_yoruba(message)
    
    # Create constant name
    const_name = f"MSG_{category_info['category'].upper()}_{index}"
    
    # Clean for constant name
    const_name = re.sub(r'[^A-Z0-9_]', '_', const_name)
    
    # Generate TypeScript
    ts_code = f"""
// {category_info['category']} - Priority: {category_info['priority']}
const {const_name} = {{
  english: `{lang_parts['english'].replace('`', "\\`")}`,
  hausa: `{lang_parts['hausa'].replace('`', "\\`")}`,
  yoruba: `{lang_parts['yoruba'].replace('`', "\\`")}`
}};
"""
    return ts_code, const_name

def generate_handler_method(category: str, messages: List[tuple]) -> str:
    """Generate handler method for a category of messages"""
    const_names = [msg[1] for msg in messages]
    
    method_name = f"handle{category.title().replace('_', '')}Messages"
    
    ts_code = f"""
  /**
   * {category} messages handler
   * Generated from flowchart - {len(messages)} messages
   */
  private async {method_name}(context: string): Promise<void> {{
    // Message selection based on context
    const messageMap: Record<string, any> = {{"""
    
    # Add each message to the map
    for i, (msg, const_name, category_info) in enumerate(messages):
        ts_code += f"\n      context_{i}: {const_name},"
    
    ts_code += """
    };
    
    // Select appropriate message
    const selectedMessage = messageMap[context] || messageMap['context_0'];
    
    // Send message in current language
    const messageText = this.getLocalizedMessage(selectedMessage);
    
    await this.sendMessage(messageText, {
      widget: 'text',
      category: '""" + category + """'
    });
    
    // Track interaction
    await this.api.createFpmInteraction({
      fpm_flow_type: '""" + category + """',
      current_fpm_method: this.state.currentFPMMethod
    });
  }
"""
    return ts_code

def generate_widget_config(messages_by_category: Dict) -> str:
    """Generate widget configuration updates"""
    
    config = """
/**
 * WIDGET CONFIGURATION UPDATES
 * Add these to your widget configuration
 */

// New question widgets
export const CHANGEFPM_WIDGETS = {
  // Side effect questions
  side_effect_concerns: {
    type: 'list',
    options: [
      { id: 'menstrual_changes', label: 'Menstrual changes / Changes in bleeding' },
      { id: 'weight_changes', label: 'Weight gain or loss' },
      { id: 'mood_changes', label: 'Mood swings or depression' },
      { id: 'headaches', label: 'Headaches or migraines' },
      { id: 'pain', label: 'Pain or discomfort' },
      { id: 'other', label: 'Other side effects' }
    ]
  },
  
  // Stop/Switch reasons
  stop_switch_reasons: {
    type: 'buttons',
    options: [
      { id: 'want_pregnant', label: 'I want to get pregnant' },
      { id: 'side_effects', label: 'Experiencing side effects' },
      { id: 'not_effective', label: 'Not working well for me' },
      { id: 'switch_method', label: 'Want to try different method' },
      { id: 'other', label: 'Other reason' }
    ]
  },
  
  // Demographic questions
  marital_status: {
    type: 'list',
    options: [
      { id: 'single', label: 'Single' },
      { id: 'married', label: 'Married' },
      { id: 'divorced', label: 'Divorced' },
      { id: 'widowed', label: 'Widowed' },
      { id: 'prefer_not_say', label: 'Prefer not to say' }
    ]
  },
  
  age_groups: {
    type: 'list',
    options: [
      { id: '15-17', label: '15-17 years' },
      { id: '18-24', label: '18-24 years' },
      { id: '25-34', label: '25-34 years' },
      { id: '35-44', label: '35-44 years' },
      { id: '45-54', label: '45-54 years' },
      { id: '55+', label: '55 and older' }
    ]
  }
};
"""
    return config

def generate_implementation_guide(messages_by_category: Dict) -> str:
    """Generate implementation guide"""
    
    guide = f"""
# MESSAGE UPDATE IMPLEMENTATION GUIDE

## Overview
This guide helps you add {sum(len(msgs) for msgs in messages_by_category.values())} missing messages to FPMChangeProvider.tsx

## Categories Found
"""
    
    for category, messages in messages_by_category.items():
        guide += f"\n### {category.title().replace('_', ' ')}\n"
        guide += f"- **Count**: {len(messages)} messages\n"
        guide += f"- **Priority**: {messages[0][2]['priority']}\n"
        guide += f"- **Handler**: `{messages[0][2]['handler']}`\n"
        guide += f"- **Widget Type**: {messages[0][2]['widget_type']}\n"
    
    guide += """

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
"""
    
    return guide

def main():
    """Main execution"""
    print("=" * 70)
    print("TASK 2: MESSAGE UPDATE SCRIPT")
    print("=" * 70)
    print("\nLoading message catalog...")
    
    catalog = load_catalog()
    missing_messages = catalog['comparison']['in_flowchart_not_provider']
    
    print(f"Found {len(missing_messages)} missing messages")
    print("\nCategorizing messages...")
    
    # Categorize all messages
    messages_by_category = {}
    all_constants = []
    
    for i, message in enumerate(missing_messages):
        category_info = categorize_message(message)
        category = category_info['category']
        
        # Generate constant
        ts_constant, const_name = generate_typescript_constant(message, i, category_info)
        all_constants.append(ts_constant)
        
        # Group by category
        if category not in messages_by_category:
            messages_by_category[category] = []
        
        messages_by_category[category].append((message, const_name, category_info))
        
        print(f"  [{i+1}/{len(missing_messages)}] {category}: {message[:60]}...")
    
    # Generate files
    print("\n" + "=" * 70)
    print("GENERATING OUTPUT FILES")
    print("=" * 70)
    
    # 1. Constants file
    with open('generated-message-constants.ts', 'w', encoding='utf-8') as f:
        f.write("/**\n * GENERATED MESSAGE CONSTANTS\n")
        f.write(f" * Total: {len(missing_messages)} messages\n")
        f.write(" * Source: changefpm.drawio.xml flowchart\n")
        f.write(" * Generated: Phase 1 extraction + Task 2 automation\n")
        f.write(" */\n\n")
        f.write('\n'.join(all_constants))
    print("✅ Generated: generated-message-constants.ts")
    
    # 2. Handler methods file
    with open('generated-handler-methods.ts', 'w', encoding='utf-8') as f:
        f.write("/**\n * GENERATED HANDLER METHODS\n")
        f.write(f" * Categories: {len(messages_by_category)}\n")
        f.write(" * Add these to FPMChangeProvider class\n")
        f.write(" */\n\n")
        
        for category, messages in messages_by_category.items():
            handler = generate_handler_method(category, messages)
            f.write(handler)
            f.write("\n")
    print("✅ Generated: generated-handler-methods.ts")
    
    # 3. Widget configuration
    with open('generated-widget-config.ts', 'w', encoding='utf-8') as f:
        f.write(generate_widget_config(messages_by_category))
    print("✅ Generated: generated-widget-config.ts")
    
    # 4. Implementation guide
    with open('MESSAGE_UPDATE_IMPLEMENTATION_GUIDE.md', 'w', encoding='utf-8') as f:
        f.write(generate_implementation_guide(messages_by_category))
    print("✅ Generated: MESSAGE_UPDATE_IMPLEMENTATION_GUIDE.md")
    
    # 5. Summary report
    summary = {
        'total_messages': len(missing_messages),
        'categories': {
            cat: {
                'count': len(msgs),
                'priority': msgs[0][2]['priority'],
                'handler': msgs[0][2]['handler']
            }
            for cat, msgs in messages_by_category.items()
        },
        'files_generated': [
            'generated-message-constants.ts',
            'generated-handler-methods.ts',
            'generated-widget-config.ts',
            'MESSAGE_UPDATE_IMPLEMENTATION_GUIDE.md'
        ]
    }
    
    with open('message-update-summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print("✅ Generated: message-update-summary.json")
    
    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"\n📊 Total messages processed: {len(missing_messages)}")
    print(f"📁 Categories created: {len(messages_by_category)}")
    print(f"\n🏷️  Message Breakdown:")
    
    for category, messages in sorted(messages_by_category.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"   {category:30s}: {len(messages):3d} messages ({messages[0][2]['priority']} priority)")
    
    print(f"\n✅ Files generated: 5")
    print("\n📖 Next steps:")
    print("   1. Review MESSAGE_UPDATE_IMPLEMENTATION_GUIDE.md")
    print("   2. Copy constants to FPMChangeProvider.tsx")
    print("   3. Copy handler methods to FPMChangeProvider.tsx")
    print("   4. Update widget configuration")
    print("   5. Connect handlers to flow logic")
    print("   6. Test each category")
    
    print("\n" + "=" * 70)

if __name__ == '__main__':
    main()
