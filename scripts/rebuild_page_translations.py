#!/usr/bin/env python3
"""
Rebuild all non-homepage page translations with proper semantic keys.
1. Defines clean English strings for each page
2. Translates them into all 14 languages using the OpenAI API
3. Writes updated message JSON files
"""

import json
import os
import time
from openai import OpenAI

client = OpenAI()
MSGS_DIR = "/home/ubuntu/turboloop-repo/next-app/messages"

# ─── Clean English strings for each page ────────────────────────────────────
PAGE_STRINGS = {
    "social-wall": {
        "eyebrow": "The Social Wall",
        "title": "Voices from everywhere.",
        "subtitle": "Every community-made TurboLoop video, in one place. Stories, tutorials, recaps — curated by the team, free to watch, ready to share. Submit your own and join the wall.",
        "submitBadge": "Submit your story",
        "submitHeading": "Your turn on the wall.",
        "submitBody": "Made a TurboLoop video? Share the link — approved submissions are featured here within 48 hours and may qualify for Creator Star payouts.",
        "submitBtn": "Submit your story",
        "creatorPayouts": "Creator payouts",
        "refreshNote": "Featured picks first · refreshed every 5 minutes",
        "videoSingular": "video on the wall",
        "videoPlural": "videos on the wall",
        "emptyHeading": "The wall is warming up.",
        "emptyBody": "Be the first to land here — submit your TurboLoop video and the team will approve within 48 hours.",
        "featuredBadge": "Featured",
    },
    "ecosystem": {
        "eyebrow": "The Ecosystem",
        "title": "Six pillars. One engine.",
        "subtitle": "TurboLoop isn't a single product — it's six DeFi primitives working together as a self-sustaining flywheel. Each one feeds the others.",
        "pillar1Title": "Loop Plans",
        "pillar1Body": "Fixed-term USDT deposits that generate daily yield. Choose 30, 60, or 90-day plans. Principal is locked; earnings compound or withdraw daily.",
        "pillar2Title": "Referral Engine",
        "pillar2Body": "12% on Level 1 referrals, 3% on Level 2. Paid instantly in USDT on every deposit your network makes — no waiting, no minimums.",
        "pillar3Title": "Sprint Loop",
        "pillar3Body": "Short-burst 7-day plans for members who want faster liquidity cycles. Same daily yield logic, compressed timeline.",
        "pillar4Title": "Creator Economy",
        "pillar4Body": "Earn per-view payouts for TurboLoop content. Submit your video, get approved, and collect USDT every time it's watched.",
        "pillar5Title": "Local Presenter Program",
        "pillar5Body": "Host weekly community Zoom sessions in your language. We cover your operating costs — $100/month stipend paid in USDT.",
        "pillar6Title": "Security Bounty",
        "pillar6Body": "Up to $100,000 USDT for verified smart contract vulnerabilities. Open to anyone, anywhere. No NDA required.",
        "learnMore": "Learn more",
        "launchApp": "Launch App",
        "metaTitle": "The TurboLoop Ecosystem — Six DeFi Pillars",
        "metaDesc": "Explore the six interconnected DeFi primitives that power TurboLoop: Loop Plans, Referral Engine, Sprint Loop, Creator Economy, Local Presenter Program, and Security Bounty.",
    },
    "community": {
        "eyebrow": "The Community",
        "title": "Voices from everywhere.",
        "subtitle": "14+ countries. 6 continents. 12+ languages. The TurboLoop community is global by design — geography no longer determines your financial destiny.",
        "joinTelegram": "Join Telegram",
        "followTwitter": "Follow on X",
        "watchYoutube": "Watch on YouTube",
        "globalHeading": "Global by design.",
        "globalBody": "Every tool, every session, every piece of content is built to work in your language and your timezone. No one gets left behind.",
        "telegramLabel": "Telegram",
        "telegramDetail": "The main hub. Announcements, support, daily Zoom links, and community conversation — all in one place.",
        "twitterLabel": "X (Twitter)",
        "twitterDetail": "Market updates, ecosystem news, and community highlights. Follow for real-time TurboLoop pulse.",
        "youtubeLabel": "YouTube",
        "youtubeDetail": "Cinematic films, how-to-join walkthroughs in 10 languages, and community reels. Free to watch, ready to share.",
        "metaTitle": "TurboLoop Community — Global DeFi in 12+ Languages",
        "metaDesc": "Join the TurboLoop community across Telegram, X, and YouTube. 14+ countries, 6 continents, 12+ languages.",
    },
    "films": {
        "eyebrow": "Watch & Learn",
        "title": "The TurboLoop Film Series.",
        "subtitle": "Cinematic short films that explain every aspect of the TurboLoop ecosystem — from smart contract security to daily yield mechanics. Free to watch, ready to share.",
        "watchNow": "Watch now",
        "allFilms": "All films",
        "minutesShort": "min",
        "featuredLabel": "Featured",
        "newLabel": "New",
        "shareBtn": "Share",
        "downloadBtn": "Download",
        "noFilms": "No films available yet.",
        "metaTitle": "TurboLoop Films — Cinematic DeFi Education Series",
        "metaDesc": "Watch the TurboLoop cinematic film series. Short films explaining DeFi yield farming, smart contract security, referral mechanics, and more.",
    },
    "security": {
        "eyebrow": "Trustless by Design",
        "title": "Five reasons to trust nobody.",
        "subtitle": "We removed every way we could harm you. What remains is code, published, locked, and verified by people who don't work for us.",
        "reason1Title": "Immutable Smart Contract",
        "reason1Body": "The contract is deployed and renounced. No admin keys, no upgrade proxy, no pause function. Not even the founders can modify it.",
        "reason2Title": "Decentralized Liquidity",
        "reason2Body": "Yield is generated from protocol-owned liquidity pools — not from new deposits. The math works even if no new members join.",
        "reason3Title": "No Admin Keys",
        "reason3Body": "Ownership was renounced at deployment. There is no wallet that can drain funds, freeze accounts, or change parameters.",
        "reason4Title": "Open Source & Verified",
        "reason4Body": "The full contract source is published and verified on BscScan. Anyone can read every line before depositing a single dollar.",
        "reason5Title": "$100K Security Bounty",
        "reason5Body": "We put $100,000 USDT on the table for anyone who finds a real vulnerability. Open to all, no NDA, paid within 7 days of verification.",
        "viewContract": "View on BscScan",
        "submitBounty": "Submit a finding",
        "metaTitle": "TurboLoop Security — Immutable Smart Contract & $100K Bounty",
        "metaDesc": "TurboLoop's smart contract is immutable, renounced, and open source. No admin keys, no upgrade proxy. $100,000 USDT bounty for verified vulnerabilities.",
    },
    "roadmap": {
        "eyebrow": "The Roadmap",
        "title": "What's built. What's next.",
        "subtitle": "The smart contract is final and immutable — there's no feature creep on the protocol itself. The roadmap is about reach, education, and community.",
        "completedLabel": "Completed",
        "inProgressLabel": "In Progress",
        "upcomingLabel": "Upcoming",
        "phase1Title": "Protocol Launch",
        "phase1Body": "Smart contract deployed, audited, and renounced on BSC. Loop Plans live. Referral engine active.",
        "phase2Title": "Community Expansion",
        "phase2Body": "Local Presenter Program launched. Daily Zoom sessions in 12+ languages. 14+ countries reached.",
        "phase3Title": "Creator Economy",
        "phase3Body": "Film series launched. Creator payout system live. Social Wall active.",
        "phase4Title": "Global Education",
        "phase4Body": "Marketing Hub with 2,800+ banners in 14 languages. Blog with 2,500+ articles. Learn section live.",
        "phase5Title": "Ecosystem Growth",
        "phase5Body": "Sprint Loop launched. Token launch preparation. Global meetups program.",
        "metaTitle": "TurboLoop Roadmap — Protocol Milestones & Future Plans",
        "metaDesc": "See what TurboLoop has built and what's coming next. The smart contract is immutable — the roadmap is about reach, education, and community growth.",
    },
    "library": {
        "eyebrow": "Watch & Learn",
        "title": "Everything in one library.",
        "subtitle": "Cinematic films, reels, and presentations — all in one place. Free to watch, ready to share.",
        "filmsTab": "Films",
        "reelsTab": "Reels",
        "presentationsTab": "Presentations",
        "watchNow": "Watch now",
        "shareBtn": "Share",
        "downloadBtn": "Download",
        "noContent": "No content available yet.",
        "featuredLabel": "Featured",
        "newLabel": "New",
        "minutesShort": "min",
        "metaTitle": "TurboLoop Library — Films, Reels & Presentations",
        "metaDesc": "The complete TurboLoop media library. Cinematic films, short reels, and presentations — all free to watch and share.",
    },
    "events": {
        "eyebrow": "Live & Daily",
        "title": "Daily Zoom in",
        "titleHighlight": "12+ languages.",
        "subtitle": "The community runs free Zoom sessions every single day. Drop in, ask anything, get onboarded. No pitch, no pressure, real conversations in your language.",
        "sessionType1Label": "Daily community calls",
        "sessionType1Detail": "Open Zoom in 12+ languages — English, Hindi, Indonesian, Portuguese, Russian, Turkish, Spanish + more. Drop in any time.",
        "sessionType2Label": "Local presenters",
        "sessionType2Detail": "Native speakers run the calls in your language. We pay them $100/month — apply at /apply.",
        "sessionType3Label": "Onboarding sessions",
        "sessionType3Detail": "Brand-new to DeFi? Smaller group calls walk you through wallet setup, your first deposit, and the math.",
        "liveNow": "Live Now · Join Anytime",
        "daily": "Daily · Every Day",
        "joinLiveCall": "Join Live Call",
        "joinTodaysCall": "Join Today's Call",
        "endsIn": "Ends in",
        "startsIn": "Starts in",
        "hours": "Hours",
        "min": "Min",
        "sec": "Sec",
        "english": "English",
        "hindiUrdu": "Hindi / Urdu",
        "findYourCall": "Find your call.",
        "findYourCallDetail": "Live links go up daily in our official Telegram. Pick your language, hop in.",
        "openTelegram": "Open Telegram",
        "becomePresenter": "Become a presenter",
    },
    "careers": {
        "eyebrow": "We're Hiring",
        "title": "Host the call. Get paid.",
        "subtitle": "Lead weekly community Zoom sessions and we'll cover your operating costs each month.",
        "applyNow": "Apply now",
        "learnMore": "Learn more",
        "roleTitle": "Local Presenter",
        "roleBody": "Run weekly Zoom sessions in your language. Build your local community. Get paid $100/month in USDT.",
        "req1": "Fluent in your target language",
        "req2": "Reliable internet connection",
        "req3": "Comfortable on video calls",
        "req4": "Passionate about DeFi and financial freedom",
        "benefit1": "$100/month stipend in USDT",
        "benefit2": "Flexible schedule — you set the time",
        "benefit3": "Official TurboLoop presenter badge",
        "benefit4": "Access to exclusive presenter resources",
        "openRoles": "Open roles",
        "seatsLeft": "seat left",
        "seatsLeftPlural": "seats left",
        "metaTitle": "Careers at TurboLoop — Become a Local Presenter",
        "metaDesc": "Join the TurboLoop Local Presenter Program. Host weekly community Zoom sessions in your language and earn $100/month in USDT.",
    },
    "promotions": {
        "eyebrow": "Earn While You Build",
        "title": "Three real ways to get paid.",
        "subtitle": "A six-figure bounty for security researchers, a per-view payout for creators, and a monthly stipend for community leaders. All paid in stablecoins.",
        "bountyTitle": "Security Bounty",
        "bountySubtitle": "Up to $100,000 USDT",
        "bountyBody": "Find a centralization risk, a vulnerability, or a rug-pull mechanism in the deployed smart contract. If verified, $100,000 paid in USDT within 7 days.",
        "bountyBadge": "Open to everyone",
        "bountyBtn": "Submit a finding",
        "creatorTitle": "Creator Payouts",
        "creatorSubtitle": "Earn per view",
        "creatorBody": "Make a TurboLoop video, submit it to the Social Wall, and earn USDT every time it's watched. No minimum views required.",
        "creatorBadge": "Per-view earnings",
        "creatorBtn": "Submit your video",
        "presenterTitle": "Local Presenter",
        "presenterSubtitle": "$100/month stipend",
        "presenterBody": "Host weekly community Zoom sessions in your language. We cover your operating costs every month, paid in USDT.",
        "presenterBadge": "Monthly stipend",
        "presenterBtn": "Apply now",
        "metaTitle": "TurboLoop Promotions — Three Ways to Earn",
        "metaDesc": "Earn with TurboLoop: $100K security bounty, per-view creator payouts, and $100/month presenter stipend. All paid in USDT stablecoins.",
    },
    "reels": {
        "eyebrow": "Short Films",
        "title": "Every reel. One place.",
        "subtitle": "Short-form videos, how-to-join walkthroughs in 10 languages, withdraw + compound + referral tutorials. Free to watch, ready to share.",
        "categoryPresentation": "Featured reels",
        "categoryPresentationDesc": "Sovereign Series shorts + multi-language project intros.",
        "categoryHowToJoin": "How to join — by language",
        "categoryHowToJoinDesc": "Step-by-step walkthroughs in 10 languages: install wallet → buy USDT → pick a Loop Plan.",
        "categoryWithdraw": "Withdraw, compound & refer",
        "categoryWithdrawDesc": "How to claim daily earnings, re-deposit to compound, and use the referral system.",
        "watchNow": "Watch now",
        "shareBtn": "Share",
        "metaTitle": "TurboLoop Reels — Short DeFi Videos in 10 Languages",
        "metaDesc": "Watch TurboLoop reels: how-to-join walkthroughs in 10 languages, withdraw and compound tutorials, referral guides. Free to watch.",
    },
    "learn": {
        "eyebrow": "DeFi 101",
        "title": "Learn DeFi from zero.",
        "subtitle": "Short explainers for people who've never touched crypto. No jargon, no fluff. Each one ends with how it connects to TurboLoop.",
        "lesson1Title": "What is DeFi?",
        "lesson1Body": "Decentralized Finance explained in plain English. What it is, why it matters, and how it's different from a bank.",
        "lesson2Title": "What is a Smart Contract?",
        "lesson2Body": "Self-executing code on the blockchain. No middleman, no trust required — the rules are written in the contract.",
        "lesson3Title": "What are Stablecoins?",
        "lesson3Body": "Crypto that doesn't go up and down. USDT, USDC — pegged to the dollar so your principal stays stable.",
        "lesson4Title": "What is Yield Farming?",
        "lesson4Body": "Earning passive income by putting your stablecoins to work in DeFi protocols. How it works, what the risks are.",
        "lesson5Title": "How to Verify a Contract",
        "lesson5Body": "Step-by-step guide to reading a smart contract on BscScan. What to look for, what red flags mean.",
        "readGuide": "Read guide",
        "minutesRead": "min read",
        "beginnerLabel": "Beginner",
        "metaTitle": "Learn DeFi — Free Beginner Guides | TurboLoop",
        "metaDesc": "New to DeFi? Learn what yield farming is, how smart contracts work, what stablecoins are, and how to earn passive income on BSC. Free guides, no jargon.",
    },
    "creatives": {
        "eyebrow": "Marketing Hub",
        "title": "Free banners. Ready to share.",
        "subtitle": "Campaign suites, branded pillars, and a 14-language educational kit. Download, share on Telegram or WhatsApp — no attribution required.",
        "statBanners": "Total banners",
        "statCategories": "Categories",
        "statLanguages": "Languages",
        "statFree": "Free to share",
        "downloadBtn": "Download",
        "shareBtn": "Share",
        "viewAll": "View all",
        "metaTitle": "TurboLoop Marketing Hub — 2,800+ Free DeFi Banners in 14 Languages",
        "metaDesc": "Download 2,800+ free DeFi marketing banners. 14 languages, campaign suites, branded educational kit. Free for the TurboLoop community.",
    },
    "blog": {
        "eyebrow": "Editorial",
        "title": "Read deeper.",
        "subtitle": "Deep dives on DeFi, yield generation, smart contract security, and the TurboLoop ecosystem. Plain English. No fluff.",
        "readArticle": "Read article →",
        "noArticles": "No articles published yet.",
        "allLanguages": "All",
        "metaTitle": "DeFi Blog & Editorial — Yield Farming Insights | TurboLoop",
        "metaDesc": "Deep dives on DeFi, yield generation, smart contract security, and the TurboLoop ecosystem. Plain English. No fluff.",
    },
}

LANGUAGES = {
    "ar": "Arabic",
    "de": "German",
    "es": "Spanish",
    "fr": "French",
    "hi": "Hindi",
    "id": "Indonesian",
    "it": "Italian",
    "ko": "Korean",
    "lo": "Lao",
    "pcm": "Nigerian Pidgin",
    "ta": "Tamil",
    "th": "Thai",
    "ur": "Urdu",
    "zh": "Chinese (Simplified)",
}

def translate_batch(strings_dict: dict, lang_code: str, lang_name: str) -> dict:
    """Translate a dict of key:value strings into the target language."""
    # Build a numbered list for the prompt
    items = list(strings_dict.items())
    numbered = "\n".join(f"{i+1}. {v}" for i, (k, v) in enumerate(items))
    
    prompt = f"""Translate the following UI strings from English to {lang_name}.
These are strings for a DeFi/crypto website called TurboLoop.
Keep brand names (TurboLoop, USDT, BSC, BscScan, DeFi, Zoom, Telegram, YouTube, X, WhatsApp) unchanged.
Keep numbers, percentages, and special characters unchanged.
Keep the same tone — professional but accessible.
Return ONLY a JSON object with the same keys as the input, with translated values.
Do not add any explanation.

Input keys and values:
{json.dumps(strings_dict, ensure_ascii=False, indent=2)}

Return format: {{"key1": "translated value 1", "key2": "translated value 2", ...}}"""

    try:
        resp = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=4000,
        )
        content = resp.choices[0].message.content.strip()
        # Extract JSON from response
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        result = json.loads(content)
        return result
    except Exception as e:
        print(f"  ERROR translating to {lang_name}: {e}")
        return {}

def main():
    # Load all existing message files
    msg_files = {}
    for lang in list(LANGUAGES.keys()) + ["en"]:
        path = f"{MSGS_DIR}/{lang}.json"
        if os.path.exists(path):
            msg_files[lang] = json.load(open(path))
        else:
            msg_files[lang] = {}

    # First, update the English file with clean keys
    print("Updating English message file with clean keys...")
    for page, strings in PAGE_STRINGS.items():
        msg_files["en"][page] = strings
    
    with open(f"{MSGS_DIR}/en.json", "w", encoding="utf-8") as f:
        json.dump(msg_files["en"], f, ensure_ascii=False, indent=2)
    print("  ✓ en.json updated")

    # Now translate each page into each language
    for lang_code, lang_name in LANGUAGES.items():
        print(f"\nTranslating to {lang_name} ({lang_code})...")
        lang_data = msg_files[lang_code]
        
        for page, strings in PAGE_STRINGS.items():
            print(f"  Translating {page}...")
            translated = translate_batch(strings, lang_code, lang_name)
            if translated:
                lang_data[page] = translated
                print(f"    ✓ {len(translated)} keys translated")
            else:
                # Fall back to English if translation fails
                lang_data[page] = strings
                print(f"    ⚠ Fell back to English for {page}")
            time.sleep(0.5)  # Rate limit protection
        
        # Save the updated language file
        with open(f"{MSGS_DIR}/{lang_code}.json", "w", encoding="utf-8") as f:
            json.dump(lang_data, f, ensure_ascii=False, indent=2)
        print(f"  ✓ {lang_code}.json saved")
        time.sleep(1)  # Extra delay between languages

    print("\n✅ All translations complete!")

if __name__ == "__main__":
    main()
