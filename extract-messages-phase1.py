"""
Phase 1: Message Audit & Alignment
Extract all unique messages from flowchart, WhatsApp script, and current implementation
Create comprehensive message catalog and gap analysis
"""

import xml.etree.ElementTree as ET
import re
import json
from typing import Dict, List, Set
from collections import defaultdict

# File paths
FLOWCHART_PATH = 'changefpm.drawio.xml'
WHATSAPP_PATH = 'WhatsApp Chat with Honey AI Chatbot.txt'
PROVIDER_PATH = 'honey/src/chatbot/sections/changeFPM/FPMChangeProvider.tsx'

def clean_html(text: str) -> str:
    """Remove HTML tags and clean text"""
    clean = re.sub(r'<[^>]+>', '', text)
    clean = clean.replace('&nbsp;', ' ').replace('&amp;', '&')
    clean = clean.replace('&lt;', '<').replace('&gt;', '>')
    clean = clean.replace('&quot;', '"').replace('&#39;', "'")
    clean = ' '.join(clean.split())  # Normalize whitespace
    return clean

def remove_emojis(text: str) -> str:
    """Remove all emojis from text"""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
        "]+", flags=re.UNICODE
    )
    return emoji_pattern.sub('', text)

def extract_flowchart_messages() -> Dict[str, List[str]]:
    """Extract all messages from the Draw.io flowchart XML"""
    print("📊 Extracting messages from flowchart...")
    
    try:
        tree = ET.parse(FLOWCHART_PATH)
        root = tree.getroot()
        
        messages = {
            'all': [],
            'questions': [],
            'responses': [],
            'instructions': [],
            'buttons': [],
            'fertility_info': [],
            'method_specific': []
        }
        
        for elem in root.iter():
            value = elem.get('value')
            if not value:
                continue
            
            # Clean and process
            clean_text = clean_html(value)
            clean_text = remove_emojis(clean_text)
            
            # Skip short or URL-only content
            if len(clean_text) < 10 or clean_text.startswith('http'):
                continue
            
            messages['all'].append(clean_text)
            
            # Categorize messages
            if '?' in clean_text:
                messages['questions'].append(clean_text)
            
            if any(word in clean_text.lower() for word in ['iud', 'implant', 'injection', 'pill', 'condom']):
                messages['method_specific'].append(clean_text)
            
            if any(word in clean_text.lower() for word in ['fertility', 'pregnant', 'ovulation']):
                messages['fertility_info'].append(clean_text)
            
            if any(word in clean_text.lower() for word in ['visit', 'clinic', 'call 7790', 'remove']):
                messages['instructions'].append(clean_text)
            
            # Button text (usually short)
            if 10 < len(clean_text) < 50 and not '?' in clean_text:
                messages['buttons'].append(clean_text)
        
        # Remove duplicates
        for category in messages:
            messages[category] = list(set(messages[category]))
        
        print(f"✅ Flowchart extraction complete:")
        print(f"   - Total messages: {len(messages['all'])}")
        print(f"   - Questions: {len(messages['questions'])}")
        print(f"   - Method-specific: {len(messages['method_specific'])}")
        print(f"   - Fertility info: {len(messages['fertility_info'])}")
        print(f"   - Instructions: {len(messages['instructions'])}")
        
        return messages
        
    except Exception as e:
        print(f"❌ Error extracting flowchart: {e}")
        return {}

def extract_whatsapp_messages() -> Dict[str, List[str]]:
    """Extract all bot messages from WhatsApp script"""
    print("\n💬 Extracting messages from WhatsApp script...")
    
    try:
        with open(WHATSAPP_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
        
        messages = {
            'all': [],
            'questions': [],
            'responses': [],
            'options': []
        }
        
        # Pattern: [date time] Honey AI Chatbot: message
        pattern = r'\[\d{1,2}/\d{1,2}/\d{2,4},\s+\d{1,2}:\d{2}:\d{2}\s*[AP]M\]\s*Honey AI Chatbot:\s*(.+?)(?=\n\[|\Z)'
        
        matches = re.findall(pattern, content, re.DOTALL)
        
        for match in matches:
            msg = match.strip()
            msg = remove_emojis(msg)
            
            if len(msg) < 5:
                continue
            
            messages['all'].append(msg)
            
            if '?' in msg:
                messages['questions'].append(msg)
            else:
                messages['responses'].append(msg)
            
            # Extract options (often numbered or bullet points)
            if re.search(r'^\d+[.\):]', msg) or msg.startswith('- '):
                messages['options'].append(msg)
        
        # Remove duplicates
        for category in messages:
            messages[category] = list(set(messages[category]))
        
        print(f"✅ WhatsApp extraction complete:")
        print(f"   - Total messages: {len(messages['all'])}")
        print(f"   - Questions: {len(messages['questions'])}")
        print(f"   - Responses: {len(messages['responses'])}")
        
        return messages
        
    except Exception as e:
        print(f"❌ Error extracting WhatsApp: {e}")
        return {}

def extract_provider_messages() -> Dict[str, List[str]]:
    """Extract all messages from FPMChangeProvider.tsx"""
    print("\n💻 Extracting messages from FPMChangeProvider.tsx...")
    
    try:
        with open(PROVIDER_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
        
        messages = {
            'all': [],
            'bot_messages': [],
            'handler_names': []
        }
        
        # Pattern: createChatBotMessage('message' or "message"
        pattern1 = r"createChatBotMessage\s*\(\s*['\"]([^'\"]+)['\"]"
        matches1 = re.findall(pattern1, content)
        
        # Pattern: multi-line strings
        pattern2 = r"createChatBotMessage\s*\(\s*['\"]([^'\"]+(?:\n[^'\"]+)*?)['\"]"
        matches2 = re.findall(pattern2, content, re.MULTILINE)
        
        all_matches = matches1 + matches2
        
        for match in all_matches:
            msg = match.strip()
            msg = remove_emojis(msg)
            msg = msg.replace('\\n', '\n')
            
            if len(msg) < 5:
                continue
            
            messages['all'].append(msg)
            messages['bot_messages'].append(msg)
        
        # Extract handler function names
        handler_pattern = r'handle(\w+)\s*=\s*async'
        handlers = re.findall(handler_pattern, content)
        messages['handler_names'] = handlers
        
        # Remove duplicates
        for category in messages:
            if isinstance(messages[category], list):
                messages[category] = list(set(messages[category]))
        
        print(f"✅ Provider extraction complete:")
        print(f"   - Total messages: {len(messages['all'])}")
        print(f"   - Handlers: {len(messages['handler_names'])}")
        
        return messages
        
    except Exception as e:
        print(f"❌ Error extracting provider: {e}")
        return {}

def compare_messages(flowchart: Dict, whatsapp: Dict, provider: Dict) -> Dict:
    """Compare messages across all sources and identify gaps"""
    print("\n🔍 Comparing messages across sources...")
    
    comparison = {
        'total_flowchart': len(flowchart.get('all', [])),
        'total_whatsapp': len(whatsapp.get('all', [])),
        'total_provider': len(provider.get('all', [])),
        'in_flowchart_not_provider': [],
        'in_whatsapp_not_provider': [],
        'in_provider_not_flowchart': [],
        'common_all_three': [],
        'fertility_messages_missing': [],
        'method_specific_missing': []
    }
    
    # Convert to sets for comparison (using lowercase for fuzzy matching)
    flowchart_set = set(msg.lower() for msg in flowchart.get('all', []))
    whatsapp_set = set(msg.lower() for msg in whatsapp.get('all', []))
    provider_set = set(msg.lower() for msg in provider.get('all', []))
    
    # Find gaps
    comparison['in_flowchart_not_provider'] = [
        msg for msg in flowchart.get('all', [])
        if msg.lower() not in provider_set
    ][:50]  # Limit to first 50
    
    comparison['in_whatsapp_not_provider'] = [
        msg for msg in whatsapp.get('all', [])
        if msg.lower() not in provider_set
    ][:50]
    
    comparison['in_provider_not_flowchart'] = [
        msg for msg in provider.get('all', [])
        if msg.lower() not in flowchart_set
    ][:20]
    
    # Find common messages
    comparison['common_all_three'] = [
        msg for msg in provider.get('all', [])
        if msg.lower() in flowchart_set and msg.lower() in whatsapp_set
    ][:20]
    
    # Check for missing fertility messages
    fertility_keywords = ['fertility', 'pregnant', 'ovulation', 'return to fertility']
    comparison['fertility_messages_missing'] = [
        msg for msg in flowchart.get('fertility_info', [])
        if not any(keyword in msg_lower for msg_lower in provider_set for keyword in fertility_keywords)
    ][:10]
    
    print(f"✅ Comparison complete:")
    print(f"   - In flowchart but not provider: {len(comparison['in_flowchart_not_provider'])}")
    print(f"   - In WhatsApp but not provider: {len(comparison['in_whatsapp_not_provider'])}")
    print(f"   - Common across all three: {len(comparison['common_all_three'])}")
    
    return comparison

def create_message_catalog(flowchart: Dict, whatsapp: Dict, provider: Dict, comparison: Dict) -> Dict:
    """Create comprehensive message catalog"""
    print("\n📝 Creating message catalog...")
    
    catalog = {
        'metadata': {
            'extraction_date': '2025-11-03',
            'total_flowchart_messages': len(flowchart.get('all', [])),
            'total_whatsapp_messages': len(whatsapp.get('all', [])),
            'total_provider_messages': len(provider.get('all', [])),
            'gaps_identified': len(comparison.get('in_flowchart_not_provider', [])) + 
                              len(comparison.get('in_whatsapp_not_provider', []))
        },
        'flowchart_messages': flowchart,
        'whatsapp_messages': whatsapp,
        'provider_messages': provider,
        'comparison': comparison,
        'recommendations': {
            'high_priority': [],
            'medium_priority': [],
            'low_priority': []
        }
    }
    
    # Generate recommendations
    if comparison.get('fertility_messages_missing'):
        catalog['recommendations']['high_priority'].append({
            'type': 'missing_fertility_info',
            'count': len(comparison['fertility_messages_missing']),
            'action': 'Add method-specific fertility timeline messages',
            'examples': comparison['fertility_messages_missing'][:3]
        })
    
    if len(comparison.get('in_flowchart_not_provider', [])) > 100:
        catalog['recommendations']['high_priority'].append({
            'type': 'many_missing_messages',
            'count': len(comparison['in_flowchart_not_provider']),
            'action': 'Review and add missing flowchart messages to provider'
        })
    
    print(f"✅ Catalog created with {len(catalog['recommendations']['high_priority'])} high-priority recommendations")
    
    return catalog

def main():
    """Main execution"""
    print("=" * 60)
    print("PHASE 1: MESSAGE AUDIT & ALIGNMENT")
    print("=" * 60)
    
    # Extract messages from all sources
    flowchart_messages = extract_flowchart_messages()
    whatsapp_messages = extract_whatsapp_messages()
    provider_messages = extract_provider_messages()
    
    # Compare messages
    comparison = compare_messages(flowchart_messages, whatsapp_messages, provider_messages)
    
    # Create catalog
    catalog = create_message_catalog(flowchart_messages, whatsapp_messages, provider_messages, comparison)
    
    # Save catalog
    output_file = 'changefpm-messages-catalog.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Message catalog saved to: {output_file}")
    print("\n📊 SUMMARY:")
    print(f"   Flowchart: {catalog['metadata']['total_flowchart_messages']} messages")
    print(f"   WhatsApp: {catalog['metadata']['total_whatsapp_messages']} messages")
    print(f"   Provider: {catalog['metadata']['total_provider_messages']} messages")
    print(f"   Gaps identified: {catalog['metadata']['gaps_identified']}")
    print(f"   High-priority recommendations: {len(catalog['recommendations']['high_priority'])}")
    
    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("1. Review changefpm-messages-catalog.json")
    print("2. Implement high-priority recommendations")
    print("3. Create update script for missing messages")
    print("=" * 60)

if __name__ == '__main__':
    main()
