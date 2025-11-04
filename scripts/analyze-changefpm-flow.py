#!/usr/bin/env python3
"""
Analyze Change/Stop FPM Flowchart and Generate Implementation Tasks
"""

import xml.etree.ElementTree as ET
import json
import re
from collections import defaultdict

def clean_text(text):
    """Remove HTML tags and decode entities"""
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities
    text = text.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    text = text.replace('&nbsp;', ' ').replace('&#xa;', '\n')
    # Clean whitespace
    text = ' '.join(text.split())
    return text.strip()

def extract_messages_from_xml(xml_path):
    """Extract all messages and flow structure from Draw.io XML"""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    messages = []
    buttons = []
    flows = []
    
    # Extract all text elements
    for elem in root.iter():
        value = elem.get('value')
        if not value:
            continue
            
        clean = clean_text(value)
        if not clean or len(clean) < 3:
            continue
            
        # Skip technical metadata
        if any(skip in clean.lower() for skip in ['legend', 'comment', 'redirect', 'button that', 'placeholder']):
            continue
            
        elem_id = elem.get('id', '')
        fill_color = elem.get('fillColor', '')
        
        # Categorize based on color and content
        if '#d5e8d4' in fill_color or '#82b366' in fill_color:  # Green = messages
            messages.append({
                'id': elem_id,
                'text': clean,
                'type': 'message'
            })
        elif '#dae8fc' in fill_color or '#6c8ebf' in fill_color:  # Blue = buttons
            buttons.append({
                'id': elem_id,
                'text': clean,
                'type': 'button'
            })
        elif '#fff2cc' in fill_color or '#d6b656' in fill_color:  # Yellow = user input
            flows.append({
                'id': elem_id,
                'text': clean,
                'type': 'user_input'
            })
    
    return {
        'messages': messages,
        'buttons': buttons,
        'flows': flows
    }

def parse_whatsapp_script(txt_path):
    """Parse WhatsApp chat export to extract actual messages"""
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract only bot messages
    bot_messages = []
    lines = content.split('\n')
    
    for line in lines:
        if 'Honey AI Chatbot:' in line:
            # Extract message after the bot name
            msg = line.split('Honey AI Chatbot:', 1)[1].strip()
            if msg and len(msg) > 3:
                # Remove emojis
                msg = re.sub(r'[^\x00-\x7F]+', '', msg).strip()
                if msg:
                    bot_messages.append(msg)
    
    return bot_messages

def find_changefpm_messages(messages, whatsapp_messages):
    """Find messages related to Change/Stop FPM flow"""
    changefpm_related = []
    
    keywords = [
        'change', 'stop', 'switch', 'dissatisfied', 'current method',
        'IUD', 'implant', 'injection', 'pill', 'sterilisation',
        'get pregnant', 'fertility', 'ovulation'
    ]
    
    for msg in messages:
        text_lower = msg['text'].lower()
        if any(keyword in text_lower for keyword in keywords):
            changefpm_related.append(msg)
    
    return changefpm_related

def main():
    xml_path = r'C:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot\changefpm.drawio.xml'
    txt_path = r'C:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot\honey\src\chatbot\WhatsApp Chat with Honey AI Chatbot.txt'
    
    print("=" * 80)
    print("CHANGE/STOP FPM FLOW ANALYSIS")
    print("=" * 80)
    
    # Extract from XML
    print("\n📊 Extracting flowchart data from XML...")
    xml_data = extract_messages_from_xml(xml_path)
    
    print(f"✅ Found {len(xml_data['messages'])} messages")
    print(f"✅ Found {len(xml_data['buttons'])} button options")
    print(f"✅ Found {len(xml_data['flows'])} flow elements")
    
    # Parse WhatsApp script
    print("\n📱 Parsing WhatsApp chat script...")
    whatsapp_messages = parse_whatsapp_script(txt_path)
    print(f"✅ Extracted {len(whatsapp_messages)} bot messages")
    
    # Find Change/Stop FPM specific content
    print("\n🔍 Identifying Change/Stop FPM related content...")
    changefpm_msgs = find_changefpm_messages(xml_data['messages'], whatsapp_messages)
    print(f"✅ Found {len(changefpm_msgs)} Change/Stop FPM messages")
    
    # Output results
    print("\n" + "=" * 80)
    print("KEY MESSAGES FROM FLOWCHART (First 20)")
    print("=" * 80)
    for i, msg in enumerate(xml_data['messages'][:20], 1):
        print(f"\n{i}. {msg['text'][:150]}")
        if len(msg['text']) > 150:
            print("   ...")
    
    print("\n" + "=" * 80)
    print("BUTTON OPTIONS (First 20)")
    print("=" * 80)
    for i, btn in enumerate(xml_data['buttons'][:20], 1):
        print(f"{i}. {btn['text']}")
    
    print("\n" + "=" * 80)
    print("WHATSAPP MESSAGES (First 20)")
    print("=" * 80)
    for i, msg in enumerate(whatsapp_messages[:20], 1):
        print(f"{i}. {msg[:100]}")
        if len(msg) > 100:
            print("   ...")
    
    # Save to JSON for detailed analysis
    output_data = {
        'flowchart_messages': [m['text'] for m in xml_data['messages']],
        'flowchart_buttons': [b['text'] for b in xml_data['buttons']],
        'whatsapp_messages': whatsapp_messages,
        'changefpm_specific': [m['text'] for m in changefpm_msgs]
    }
    
    output_path = r'C:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot\scripts\changefpm-analysis.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Full analysis saved to: {output_path}")
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
