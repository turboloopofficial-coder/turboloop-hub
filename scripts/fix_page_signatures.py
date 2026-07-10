#!/usr/bin/env python3
"""
Fix the malformed function signatures caused by the patch script.
The issue: getTranslations call got inserted inside the function signature.
Pattern to fix:
  export default async function FnName({
    const t = await getTranslations(...); locale }: { locale?: string }) {
Should be:
  export default async function FnName({ locale }: { locale?: string }) {
    const t = await getTranslations(...);
"""

import re
import os

PAGES_DIR = "/home/ubuntu/turboloop-repo/next-app/app"
PAGES = ["ecosystem", "community", "films", "security", "roadmap", "library", 
         "events", "careers", "promotions", "reels", "learn", "creatives", "blog"]

for page in PAGES:
    path = f"{PAGES_DIR}/{page}/page.tsx"
    if not os.path.exists(path):
        continue
    
    content = open(path).read()
    
    # Fix the malformed pattern:
    # export default async function FnName({\n  const t = await getTranslations(...); locale }: { locale?: string }) {
    # ->
    # export default async function FnName({ locale }: { locale?: string }) {\n  const t = await getTranslations(...);
    
    pattern = r'(export default async function \w+)\(\{\s*\n\s*(const t = await getTranslations\([^;]+\);)\s*locale \}: \{ locale\?: string \}\) \{'
    
    def fix_signature(m):
        fn_decl = m.group(1)
        translations_call = m.group(2)
        return f'{fn_decl}({{ locale }}: {{ locale?: string }}) {{\n  {translations_call}'
    
    new_content = re.sub(pattern, fix_signature, content, flags=re.DOTALL)
    
    if new_content != content:
        open(path, 'w').write(new_content)
        print(f"  ✓ Fixed {page}")
    else:
        # Try alternative pattern (single line)
        pattern2 = r'(export default async function \w+)\(\{(const t = await getTranslations\([^;]+\);) locale \}: \{ locale\?: string \}\) \{'
        new_content2 = re.sub(pattern2, fix_signature, content)
        if new_content2 != content:
            open(path, 'w').write(new_content2)
            print(f"  ✓ Fixed {page} (alt pattern)")
        else:
            print(f"  -- No fix needed for {page}")

print("\nDone!")
