#!/usr/bin/env python3
"""
Translate all non-homepage page strings into 14 languages.
Uses the built-in OpenAI client with proper rate limit handling.
"""

import json
import os
import time
import re
from pathlib import Path
from openai import OpenAI

client = OpenAI()  # Uses OPENAI_API_KEY and OPENAI_API_BASE from env

MESSAGES_DIR = Path(__file__).parent.parent / "next-app" / "messages"
SCRIPTS_DIR = Path(__file__).parent

LANGUAGES = [
    ("fr", "French"),
    ("es", "Spanish"),
    ("hi", "Hindi"),
    ("ta", "Tamil"),
    ("th", "Thai"),
    ("ko", "Korean"),
    ("lo", "Lao"),
    ("zh", "Chinese (Simplified)"),
    ("ar", "Arabic"),
    ("it", "Italian"),
    ("ur", "Urdu"),
    ("pcm", "Nigerian Pidgin"),
    ("de", "German"),
    ("id", "Indonesian"),
]

def translate_strings(strings_dict: dict, lang_name: str) -> dict:
    """Translate a dict of strings to the target language."""
    prompt = json.dumps(strings_dict, ensure_ascii=False, indent=2)
    
    for attempt in range(5):
        try:
            response = client.chat.completions.create(
                model="claude-sonnet-4-6",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"You are a professional translator for a DeFi protocol called TurboLoop. "
                            f"Translate the following JSON object of UI strings from English to {lang_name}. "
                            f"Keep the exact same JSON keys. "
                            f"Return ONLY valid JSON, no markdown formatting, no explanations. "
                            f"Preserve any special characters like → or · exactly as-is."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=4096,
            )
            content = response.choices[0].message.content.strip()
            # Strip markdown code blocks if present
            content = re.sub(r'^```json\s*', '', content)
            content = re.sub(r'\s*```$', '', content)
            return json.loads(content)
        except Exception as e:
            wait = 15 * (attempt + 1)
            print(f"    Attempt {attempt+1} failed: {e}. Waiting {wait}s...")
            time.sleep(wait)
    
    return {}

def main():
    # Load the English message file
    en_path = MESSAGES_DIR / "en.json"
    with open(en_path) as f:
        en_json = json.load(f)
    
    # Get all page keys that were added (they are the non-original keys)
    original_keys = {"nav", "home", "calculator", "faq", "apply", "token", "common", 
                     "footer", "meta", "protocol", "numbers", "security", "zoom", 
                     "reels", "creatives", "testimonial", "newsletter", "manifesto", "events"}
    
    page_keys = {k: v for k, v in en_json.items() if k not in original_keys and isinstance(v, dict)}
    
    if not page_keys:
        print("No new page keys found in en.json. Run extract-strings.js first.")
        return
    
    print(f"Found {len(page_keys)} page sections to translate: {list(page_keys.keys())}")
    
    for lang_code, lang_name in LANGUAGES:
        lang_path = MESSAGES_DIR / f"{lang_code}.json"
        
        if lang_path.exists():
            with open(lang_path) as f:
                lang_json = json.load(f)
        else:
            lang_json = {}
        
        print(f"\nTranslating to {lang_name} ({lang_code})...")
        
        changed = False
        for page_key, strings in page_keys.items():
            if page_key in lang_json:
                print(f"  - {page_key}: already translated, skipping")
                continue
            
            print(f"  - Translating {page_key} ({len(strings)} strings)...")
            translated = translate_strings(strings, lang_name)
            
            if translated:
                lang_json[page_key] = translated
                changed = True
                print(f"    Done.")
                time.sleep(3)  # Small delay between pages
            else:
                print(f"    FAILED to translate {page_key}")
        
        if changed:
            with open(lang_path, "w", encoding="utf-8") as f:
                json.dump(lang_json, f, ensure_ascii=False, indent=2)
            print(f"  Saved {lang_path.name}")
        
        # Delay between languages to avoid rate limits
        time.sleep(5)
    
    print("\nAll translations complete!")

if __name__ == "__main__":
    main()
