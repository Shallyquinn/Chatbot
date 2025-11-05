#!/usr/bin/env python3
"""
Script to sync English chatbot updates to Yoruba/Hausa versions
while preserving translated message strings.
"""

import re
import os
import json
from pathlib import Path
from typing import Dict, Set, List, Tuple

def extract_message_strings(file_path: str) -> Dict[str, str]:
    """
    Extract message strings from a file.
    Returns a dict mapping context -> translated string.
    """
    if not os.path.exists(file_path):
        return {}
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    messages = {}
    
    # Pattern 1: createChatBotMessage('message', ...)
    pattern1 = r"createChatBotMessage\s*\(\s*['\"`](.*?)['\"`]"
    for match in re.finditer(pattern1, content, re.DOTALL):
        msg = match.group(1)
        if msg and len(msg) > 10:  # Only meaningful messages
            # Use first 50 chars as key
            key = msg[:50].strip()
            messages[key] = msg
    
    # Pattern 2: message: 'string'
    pattern2 = r"message:\s*['\"`](.*?)['\"`]"
    for match in re.finditer(pattern2, content, re.DOTALL):
        msg = match.group(1)
        if msg and len(msg) > 10:
            key = msg[:50].strip()
            messages[key] = msg
    
    # Pattern 3: title: 'string'
    pattern3 = r"title:\s*['\"`](.*?)['\"`]"
    for match in re.finditer(pattern3, content, re.DOTALL):
        msg = match.group(1)
        if msg and len(msg) > 5:
            key = msg[:50].strip()
            messages[key] = msg
    
    return messages

def scan_directory_for_messages(dir_path: str) -> Dict[str, str]:
    """Scan entire directory for translated messages."""
    all_messages = {}
    
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                messages = extract_message_strings(file_path)
                all_messages.update(messages)
    
    return all_messages

def main():
    base_dir = Path("C:/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot/honey/src")
    
    print("🔍 Scanning for translated messages...")
    
    # Extract translated messages
    yoruba_messages = scan_directory_for_messages(str(base_dir / "yoruba-chatbot"))
    hausa_messages = scan_directory_for_messages(str(base_dir / "hausa-chatbot"))
    
    print(f"✅ Found {len(yoruba_messages)} Yoruba message strings")
    print(f"✅ Found {len(hausa_messages)} Hausa message strings")
    
    # Save to JSON for inspection
    output_dir = base_dir.parent.parent
    with open(output_dir / "yoruba-translations.json", 'w', encoding='utf-8') as f:
        json.dump(yoruba_messages, f, indent=2, ensure_ascii=False)
    
    with open(output_dir / "hausa-translations.json", 'w', encoding='utf-8') as f:
        json.dump(hausa_messages, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Translation maps saved:")
    print(f"   - {output_dir / 'yoruba-translations.json'}")
    print(f"   - {output_dir / 'hausa-translations.json'}")
    
    print("\n⚠️  Manual merge required:")
    print("   The translation differences are too complex for automated replacement.")
    print("   Recommendation: Copy English files and manually restore translations using the JSON maps.")

if __name__ == "__main__":
    main()
