#!/usr/bin/env python3
"""
Patches all non-homepage page components to:
1. Accept a `locale` prop
2. Import and use getTranslations from next-intl/server
3. Replace hardcoded PageHero strings with translation calls
"""

import re
import os

PAGES_DIR = "/home/ubuntu/turboloop-repo/next-app/app"

# Map of page -> (function_name, eyebrow, title, subtitle_pattern)
# We'll do targeted string replacements
PATCHES = {
    "ecosystem": {
        "fn": "EcosystemIndexPage",
        "eyebrow": "The Ecosystem",
        "title": "Six pillars. One engine.",
        "subtitle": "TurboLoop isn't a single product — it's six DeFi primitives working together as a self-sustaining flywheel. Each one feeds the others.",
        "extra_strings": {
            'Read about {pillar.title}': '{t("learnMore")} {pillar.title}',
        }
    },
    "community": {
        "fn": "CommunityPage",
        "eyebrow": "The Community",
        "title": "Voices from everywhere.",
        "subtitle": "14+ countries. 6 continents. 12+ languages. The TurboLoop community is global by design — geography no longer determines your financial destiny.",
    },
    "films": {
        "fn": "FilmsPage",
        "eyebrow": None,  # films has dynamic subtitle
        "title": None,
        "subtitle": None,
    },
    "security": {
        "fn": "SecurityPage",
        "eyebrow": "Trustless by Design",
        "title": "Five reasons to trust nobody.",
        "subtitle": "We removed every way we could harm you. What remains is code, published, locked, and verified by people who don't work for us.",
    },
    "roadmap": {
        "fn": "RoadmapPage",
        "eyebrow": "The Roadmap",
        "title": "What's built. What's next.",
        "subtitle": "The smart contract is final and immutable — there's no feature creep on the protocol itself. The roadmap is about reach, education, and community.",
    },
    "library": {
        "fn": "LibraryPage",
        "eyebrow": "Watch & Learn",
        "title": "Everything in one library.",
        "subtitle": None,  # dynamic
    },
    "events": {
        "fn": "EventsPage",
        "eyebrow": None,  # already has translations
        "title": None,
        "subtitle": None,
    },
    "careers": {
        "fn": "CareersPage",
        "eyebrow": "We're Hiring",
        "title": "Host the call. Get paid.",
        "subtitle": None,  # dynamic seat count
    },
    "promotions": {
        "fn": "PromotionsPage",
        "eyebrow": "Earn While You Build",
        "title": "Three real ways to get paid.",
        "subtitle": "A six-figure bounty for security researchers, a per-view payout for creators, and a monthly stipend for community leaders. All paid in stablecoins.",
    },
    "reels": {
        "fn": "ReelsPage",
        "eyebrow": None,  # dynamic
        "title": None,
        "subtitle": None,
    },
    "learn": {
        "fn": "LearnPage",
        "eyebrow": "DeFi 101",
        "title": "Learn DeFi from zero.",
        "subtitle": "Short explainers for people who've never touched crypto. No jargon, no fluff. Each one ends with how it connects to TurboLoop.",
    },
    "creatives": {
        "fn": "CreativesPage",
        "eyebrow": "Marketing Hub",
        "title": None,  # dynamic count
        "subtitle": "Campaign suites, branded pillars, and a 14-language educational kit. Download, share on Telegram or WhatsApp — no attribution required.",
    },
    "blog": {
        "fn": "BlogPage",
        "eyebrow": None,  # blog has its own structure
        "title": None,
        "subtitle": None,
    },
}

def patch_page(page_name: str, config: dict):
    path = f"{PAGES_DIR}/{page_name}/page.tsx"
    if not os.path.exists(path):
        print(f"  SKIP: {path} not found")
        return
    
    content = open(path).read()
    
    # Skip if already patched
    if "locale?: string" in content or "locale: string" in content:
        print(f"  SKIP: {page_name} already patched")
        return
    
    fn_name = config["fn"]
    namespace = page_name
    
    # 1. Add getTranslations import if not present
    if "getTranslations" not in content:
        # Add after the last import line
        content = content.replace(
            'import { getTranslations } from "next-intl/server";',
            ''
        )
        # Find the last import and add after it
        last_import_match = list(re.finditer(r'^import .+;$', content, re.MULTILINE))
        if last_import_match:
            last_import = last_import_match[-1]
            insert_pos = last_import.end()
            content = content[:insert_pos] + '\nimport { getTranslations } from "next-intl/server";' + content[insert_pos:]
    
    # 2. Update the function signature to accept locale prop
    # Match: export default async function FnName() or export default function FnName()
    fn_pattern = rf'(export default (?:async )?function {fn_name})\(\)'
    fn_replacement = r'\1({ locale }: { locale?: string })'
    content = re.sub(fn_pattern, fn_replacement, content)
    
    # Also handle: export default async function FnName({ ... })
    # If already has params, add locale
    fn_pattern2 = rf'(export default (?:async )?function {fn_name})\(\{{([^}}]+)\}}\)'
    def add_locale_param(m):
        existing = m.group(2).strip()
        if 'locale' in existing:
            return m.group(0)
        return f'{m.group(1)}({{ {existing}, locale }}: {{ {existing.split(":")[0].strip()}: any; locale?: string }})'
    content = re.sub(fn_pattern2, add_locale_param, content)
    
    # 3. Add getTranslations call at the start of the function body
    # Find the function body opening brace
    fn_body_pattern = rf'(export default (?:async )?function {fn_name}[^{{]+\{{)'
    def add_translations_call(m):
        return m.group(0) + f'\n  const t = await getTranslations({{ locale: locale ?? "en", namespace: "{namespace}" }});'
    
    if f'const t = await getTranslations' not in content:
        content = re.sub(fn_body_pattern, add_translations_call, content)
        
        # Make function async if it isn't already
        if f'export default function {fn_name}' in content:
            content = content.replace(
                f'export default function {fn_name}',
                f'export default async function {fn_name}'
            )
    
    # 4. Replace PageHero hardcoded strings
    eyebrow = config.get("eyebrow")
    title = config.get("title")
    subtitle = config.get("subtitle")
    
    if eyebrow:
        content = content.replace(f'eyebrow="{eyebrow}"', 'eyebrow={t("eyebrow")}')
    if title:
        content = content.replace(f'title="{title}"', 'title={t("title")}')
    if subtitle:
        content = content.replace(f'subtitle="{subtitle}"', 'subtitle={t("subtitle")}')
    
    open(path, 'w').write(content)
    print(f"  ✓ Patched {page_name}")

print("Patching page components for i18n...")
for page_name, config in PATCHES.items():
    print(f"\nPatching {page_name}...")
    patch_page(page_name, config)

print("\n✅ All pages patched!")
