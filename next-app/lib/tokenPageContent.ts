// /token page user-facing strings, keyed by language. The page reads
// from this map based on the `?lang=` query parameter (same pattern
// /films uses). Adding a language = filling in one block of strings
// below; no page-component edits needed.
//
// What's translated: marketing copy, section headings, button labels,
// table column headers, narrative paragraphs.
//
// What stays in English regardless of language: proper nouns ($TURBO,
// TurboLoop, USDT, BscScan, PancakeSwap, Loop Plan names, Leadership
// Program rank names like Partner / Legend), all numeric values, all
// URLs, contract addresses, and the structured-data fields. Those
// always render from `lib/tokenFacts.ts` directly.

export type SupportedLang = "en" | "de" | "hi" | "id";

export interface TokenPageStrings {
  // Hero (Section A)
  hero_eyebrow: string;
  hero_title_pre: string;
  hero_title_post: string;
  hero_subtitle_pre: string;
  hero_subtitle_supply: string;
  hero_subtitle_post: string;
  hero_cta_buy: string;
  hero_cta_chart: string;
  hero_cta_bscscan: string;

  // Stats bar (Section B) — labels only; numbers come from the widget
  stats_price_label: string;
  stats_change_label: string;
  stats_volume_label: string;
  stats_liquidity_label: string;

  // Section C: How you earn tokens
  earn_eyebrow: string;
  earn_title: string;
  earn_subtitle: string;
  earn_table_col_deposit: string;
  earn_table_col_reward: string;
  earn_example_label: string;
  earn_example_intro: string; // contains placeholders {{deposit}} {{tier}} {{rewardUsd}} {{tokens}} {{symbol}}
  earn_example_your_share: string;
  earn_example_referrer_share: string;
  earn_example_footnote: string;
  earn_additive_note: string;
  earn_manage_cta: string;
  earn_calculator_cta: string;

  // Section D: Vesting
  vesting_eyebrow: string;
  vesting_title: string;
  vesting_subtitle: string;
  vesting_table_col_rank: string;
  vesting_table_col_monthly: string;
  vesting_table_col_full: string;
  vesting_leadership_link_text: string;

  // Section E: Deflationary
  deflationary_eyebrow: string;
  deflationary_title: string;
  deflationary_subtitle: string;
  deflationary_flow_label: string;
  deflationary_step_fees: string;
  deflationary_step_buyback: string;
  deflationary_step_burn: string;
  deflationary_burn_caption: string;
  deflationary_bscscan_link: string;
  trade_tax_label: string;
  trade_tax_buy_label: string;
  trade_tax_sell_label: string;
  trade_tax_explainer: string;

  // Section F: Security
  security_eyebrow: string;
  security_title: string;
  security_subtitle: string;
  security_lp_label: string;
  security_lp_detail: string;
  security_lp_link: string;
  security_team_label: string;
  security_team_detail: string;
  security_insider_label: string;
  security_insider_detail: string;
  security_renounce_label: string;
  security_renounce_detail: string;
  security_renounce_link: string;
  security_token_contract_label: string;
  security_pair_label: string;
  security_buyback_contract_label: string;

  // Section G: Where to buy
  trade_eyebrow: string;
  trade_title: string;
  trade_subtitle: string;
  trade_native_badge: string;
  trade_native_title: string;
  trade_native_subtitle: string;
  trade_native_buy_cta: string;
  trade_native_sell_cta: string;
  trade_pancake_badge: string;
  trade_pancake_title: string;
  trade_pancake_subtitle: string;
  trade_pancake_cta: string;
  trade_pancake_chart_cta: string;
}

// ── English (source of truth) ─────────────────────────────────────

const en: TokenPageStrings = {
  hero_eyebrow: "Native rewards token · BSC",
  hero_title_pre: "Earn ",
  hero_title_post: " on every deposit.",
  hero_subtitle_pre:
    "An extra rewards layer on top of your fixed TurboLoop yields — with zero impact on protocol performance.",
  hero_subtitle_supply: "1,000,000 total supply.",
  hero_subtitle_post:
    " 100% LP locked. No team allocation. No insider reserve.",
  hero_cta_buy: "Buy",
  hero_cta_chart: "View chart on DexScreener",
  hero_cta_bscscan: "View contract on BscScan",

  stats_price_label: "Price",
  stats_change_label: "24h Change",
  stats_volume_label: "24h Volume",
  stats_liquidity_label: "Liquidity",

  earn_eyebrow: "Earn on every Power or Ultimate deposit",
  earn_title: "How you earn $TURBO",
  earn_subtitle:
    "Deposit USDT into a Power (30-day) or Ultimate (60-day) Loop Plan. Get $TURBO on top — a percentage of your deposit value, split 70% to you and 30% to your referrer. Sprint and Boost deposits are not eligible.",
  earn_table_col_deposit: "Deposit Amount (USDT)",
  earn_table_col_reward: "Token Reward",
  earn_example_label: "Worked example",
  earn_example_intro:
    "Deposit **$1,000** in a Power or Ultimate Loop Plan → fall into the **1.20%** tier → reward value **$12.00** → token count is then locked at the live market price at the exact moment of deposit.",
  earn_example_your_share: "to you:",
  earn_example_referrer_share: "to your referrer:",
  earn_example_footnote:
    "Token count is fixed at the moment of deposit, calculated against the live market price at that exact time.",
  earn_additive_note:
    "Token rewards are **additive**. They're paid out on top of your Power or Ultimate Loop Plan yield and don't change your fixed ROI in any way. **Only Power (30-day) and Ultimate (60-day) plans qualify** — Sprint and Boost earn their standard flat USDT ROI but no token rewards. Minimum deposit for token rewards: **$100**.",
  earn_manage_cta: "Manage in App",
  earn_calculator_cta: "Run the numbers",

  vesting_eyebrow: "Vesting · monthly unlock",
  vesting_title: "Your Leadership rank unlocks tokens faster",
  vesting_subtitle:
    "Your existing TurboLoop Leadership Program rank determines how fast vested tokens unlock each month. Higher rank = faster unlock. Base unlock is 10%/month for unranked users; ranks scale up to 20%/month at Legend. First installment is paid out instantly on deposit. Fully smart-contract automated — no manual claims.",
  vesting_table_col_rank: "Rank",
  vesting_table_col_monthly: "Monthly Unlock",
  vesting_table_col_full: "Months to Full Unlock",
  vesting_leadership_link_text: "See how the Leadership Program works",

  deflationary_eyebrow: "Deflationary by design",
  deflationary_title: "Daily buyback & burn",
  deflationary_subtitle:
    "Daily, the protocol uses 10% of admin fees from the main TurboLoop platform to buy $TURBO from the market and burn it forever. Smart-contract automated — no manual intervention.",
  deflationary_flow_label: "How it flows",
  deflationary_step_fees: "Protocol admin fees",
  deflationary_step_buyback: "Daily automated buyback",
  deflationary_step_burn: "Permanent burn — $TURBO supply decreases",
  deflationary_burn_caption: "View the BuyBack & Burn contract on",
  deflationary_bscscan_link: "BscScan",
  trade_tax_label: "Trade tax",
  trade_tax_buy_label: "buy tax",
  trade_tax_sell_label: "sell tax",
  trade_tax_explainer:
    "Trade tax is collected by admin and applied on every buy and sell across all venues (native swap, PancakeSwap, any DEX routing through the pair).",

  security_eyebrow: "Security & transparency",
  security_title: "Fair launch, fully on-chain, no admin keys",
  security_subtitle:
    "Every claim verifiable on BscScan. Click any address to copy it; click any link to view it on-chain.",
  security_lp_label: "100% LP Locked",
  security_lp_detail: "Liquidity tokens are locked on-chain, fully verifiable.",
  security_lp_link: "View LP transaction",
  security_team_label: "No team allocation",
  security_team_detail: "0% reserved for the team. 100% fair launch.",
  security_insider_label: "No insider reserve",
  security_insider_detail:
    "No pre-mine. No hidden allocation. The entire supply went into the launch.",
  security_renounce_label: "Ownership renounced",
  security_renounce_detail:
    "Token contract and buyback contract ownership both burned on-chain.",
  security_renounce_link: "View renounce transaction",
  security_token_contract_label: "Token contract",
  security_pair_label: "USDT/TURBO pair",
  security_buyback_contract_label: "Buyback contract",

  trade_eyebrow: "Buy & sell",
  trade_title: "Two ways to trade",
  trade_subtitle:
    "The TurboLoop native swap is the fastest path. PancakeSwap is supported as an advanced option for users who prefer trading directly on the DEX. 1% buy / 2% sell trade tax applies on both venues.",
  trade_native_badge: "Recommended",
  trade_native_title: "TurboLoop Native Swap",
  trade_native_subtitle:
    "Trade $TURBO directly inside the TurboLoop dApp. One-click USDT ↔ TURBO swaps, integrated with your deposit and rewards dashboard.",
  trade_native_buy_cta: "Buy",
  trade_native_sell_cta: "Sell",
  trade_pancake_badge: "Advanced",
  trade_pancake_title: "PancakeSwap",
  trade_pancake_subtitle:
    "If you prefer trading directly on the DEX, $TURBO is available on PancakeSwap V2 — the same liquidity pool that powers the native swap.",
  trade_pancake_cta: "Open in PancakeSwap",
  trade_pancake_chart_cta: "Chart",
};

// ── German (Du-form, Heise tech style) ────────────────────────────

const de: TokenPageStrings = {
  hero_eyebrow: "Natives Reward-Token · BSC",
  hero_title_pre: "Verdiene ",
  hero_title_post: " bei jedem Deposit.",
  hero_subtitle_pre:
    "Eine zusätzliche Reward-Ebene oben auf deine festen TurboLoop-Yields — ohne jegliche Auswirkung auf die Protokoll-Performance.",
  hero_subtitle_supply: "1.000.000 Gesamtangebot.",
  hero_subtitle_post:
    " 100% LP gelockt. Keine Team-Zuteilung. Keine Insider-Reserve.",
  hero_cta_buy: "Kaufen",
  hero_cta_chart: "Chart auf DexScreener ansehen",
  hero_cta_bscscan: "Vertrag auf BscScan ansehen",

  stats_price_label: "Preis",
  stats_change_label: "24h Veränderung",
  stats_volume_label: "24h Volumen",
  stats_liquidity_label: "Liquidität",

  earn_eyebrow: "Verdiene bei jedem Power- oder Ultimate-Deposit",
  earn_title: "So verdienst du $TURBO",
  earn_subtitle:
    "Deponiere USDT in einen Power (30 Tage) oder Ultimate (60 Tage) Loop Plan. Erhalte $TURBO obendrauf — ein Prozentsatz deines Deposit-Werts, aufgeteilt 70% an dich und 30% an deinen Referrer. Sprint- und Boost-Deposits sind nicht qualifiziert.",
  earn_table_col_deposit: "Deposit-Betrag (USDT)",
  earn_table_col_reward: "Token-Reward",
  earn_example_label: "Konkretes Beispiel",
  earn_example_intro:
    "Deponiere **$1.000** in einen Power- oder Ultimate-Plan → du fällst in die **1,20%**-Stufe → Reward-Wert **$12,00** → die Token-Anzahl wird dann zum Live-Marktpreis genau zum Zeitpunkt des Deposits fixiert.",
  earn_example_your_share: "an dich:",
  earn_example_referrer_share: "an deinen Referrer:",
  earn_example_footnote:
    "Die Token-Anzahl wird im Moment des Deposits fixiert, berechnet anhand des Live-Marktpreises zu genau diesem Zeitpunkt.",
  earn_additive_note:
    "Token-Rewards sind **additiv**. Sie werden zusätzlich zu deinem Power- oder Ultimate-Yield ausgezahlt und ändern deine feste ROI in keiner Weise. **Nur Power- (30 Tage) und Ultimate- (60 Tage) Pläne qualifizieren sich** — Sprint und Boost verdienen ihren Standard-USDT-ROI, aber keine Token-Rewards. Mindest-Deposit für Token-Rewards: **$100**.",
  earn_manage_cta: "In der App verwalten",
  earn_calculator_cta: "Zahlen durchrechnen",

  vesting_eyebrow: "Vesting · monatliches Unlock",
  vesting_title: "Dein Leadership-Rank schaltet Tokens schneller frei",
  vesting_subtitle:
    "Dein bestehender TurboLoop Leadership Program Rank bestimmt, wie schnell sich vestete Tokens jeden Monat freischalten. Höherer Rank = schnelleres Unlock. Base-Unlock liegt bei 10%/Monat für unrankierte Nutzer; Ränge skalieren bis zu 20%/Monat bei Legend. Die erste Rate wird sofort beim Deposit ausgezahlt. Vollständig Smart-Contract-automatisiert — kein manuelles Claimen.",
  vesting_table_col_rank: "Rank",
  vesting_table_col_monthly: "Monatliches Unlock",
  vesting_table_col_full: "Monate bis vollständiges Unlock",
  vesting_leadership_link_text: "So funktioniert das Leadership Program",

  deflationary_eyebrow: "Deflationär konzipiert",
  deflationary_title: "Täglicher Buyback & Burn",
  deflationary_subtitle:
    "Täglich nutzt das Protokoll 10% der Admin-Fees aus der TurboLoop-Hauptplattform, um $TURBO vom Markt zu kaufen und für immer zu verbrennen. Smart-Contract-automatisiert — keine manuelle Intervention.",
  deflationary_flow_label: "So läuft es ab",
  deflationary_step_fees: "Protokoll-Admin-Fees",
  deflationary_step_buyback: "Täglicher automatisierter Buyback",
  deflationary_step_burn:
    "Permanenter Burn — $TURBO-Angebot sinkt",
  deflationary_burn_caption:
    "Den BuyBack-&-Burn-Vertrag ansehen auf",
  deflationary_bscscan_link: "BscScan",
  trade_tax_label: "Trade-Tax",
  trade_tax_buy_label: "Kauf-Tax",
  trade_tax_sell_label: "Verkauf-Tax",
  trade_tax_explainer:
    "Die Trade-Tax wird vom Admin eingezogen und gilt bei jedem Kauf und Verkauf über alle Venues hinweg (Native Swap, PancakeSwap, jede DEX, die über das Pair routet).",

  security_eyebrow: "Sicherheit & Transparenz",
  security_title:
    "Fair Launch, vollständig on-chain, keine Admin-Keys",
  security_subtitle:
    "Jede Behauptung verifizierbar auf BscScan. Klicke eine Adresse, um sie zu kopieren; klicke einen Link, um sie on-chain zu sehen.",
  security_lp_label: "100% LP gelockt",
  security_lp_detail:
    "Liquiditäts-Tokens sind on-chain gelockt, vollständig verifizierbar.",
  security_lp_link: "LP-Transaktion ansehen",
  security_team_label: "Keine Team-Zuteilung",
  security_team_detail: "0% für das Team reserviert. 100% Fair Launch.",
  security_insider_label: "Keine Insider-Reserve",
  security_insider_detail:
    "Kein Pre-Mine. Keine versteckte Zuteilung. Das gesamte Angebot ging in den Launch.",
  security_renounce_label: "Eigentum aufgegeben",
  security_renounce_detail:
    "Das Eigentum am Token-Vertrag und am Buyback-Vertrag wurde beides on-chain verbrannt.",
  security_renounce_link: "Renounce-Transaktion ansehen",
  security_token_contract_label: "Token-Vertrag",
  security_pair_label: "USDT/TURBO Pair",
  security_buyback_contract_label: "Buyback-Vertrag",

  trade_eyebrow: "Kaufen & Verkaufen",
  trade_title: "Zwei Wege zum Trading",
  trade_subtitle:
    "Der TurboLoop Native Swap ist der schnellste Weg. PancakeSwap wird als erweiterte Option für Nutzer unterstützt, die direkt auf der DEX traden möchten. 1% Kauf / 2% Verkauf Trade-Tax gilt auf beiden Venues.",
  trade_native_badge: "Empfohlen",
  trade_native_title: "TurboLoop Native Swap",
  trade_native_subtitle:
    "Trade $TURBO direkt in der TurboLoop dApp. One-Click USDT ↔ TURBO Swaps, integriert mit deinem Deposit- und Rewards-Dashboard.",
  trade_native_buy_cta: "Kaufen",
  trade_native_sell_cta: "Verkaufen",
  trade_pancake_badge: "Erweitert",
  trade_pancake_title: "PancakeSwap",
  trade_pancake_subtitle:
    "Wenn du lieber direkt auf der DEX tradest, ist $TURBO auf PancakeSwap V2 verfügbar — dem gleichen Liquidity-Pool, der den Native Swap betreibt.",
  trade_pancake_cta: "In PancakeSwap öffnen",
  trade_pancake_chart_cta: "Chart",
};

// ── Hindi (Devanagari script, Roman for crypto/UI terms) ──────────

const hi: TokenPageStrings = {
  hero_eyebrow: "नेटिव रिवॉर्ड्स टोकन · BSC",
  hero_title_pre: "हर डिपॉज़िट पर ",
  hero_title_post: " कमाएँ।",
  hero_subtitle_pre:
    "आपकी फिक्स्ड TurboLoop यील्ड्स के ऊपर एक एक्स्ट्रा रिवॉर्ड्स लेयर — प्रोटोकॉल परफॉर्मेंस पर शून्य प्रभाव।",
  hero_subtitle_supply: "1,000,000 कुल सप्लाई।",
  hero_subtitle_post:
    " 100% LP लॉक्ड। कोई टीम अलोकेशन नहीं। कोई इनसाइडर रिज़र्व नहीं।",
  hero_cta_buy: "खरीदें",
  hero_cta_chart: "DexScreener पर चार्ट देखें",
  hero_cta_bscscan: "BscScan पर कॉन्ट्रैक्ट देखें",

  stats_price_label: "कीमत",
  stats_change_label: "24h बदलाव",
  stats_volume_label: "24h वॉल्यूम",
  stats_liquidity_label: "लिक्विडिटी",

  earn_eyebrow: "हर Power या Ultimate डिपॉज़िट पर कमाएँ",
  earn_title: "$TURBO कैसे कमाएँ",
  earn_subtitle:
    "Power (30-day) या Ultimate (60-day) Loop Plan में USDT डिपॉज़िट करें। ऊपर से $TURBO पाएँ — आपकी डिपॉज़िट वैल्यू का एक प्रतिशत, 70% आपको और 30% आपके रेफरर को मिलता है। Sprint और Boost डिपॉज़िट eligible नहीं हैं।",
  earn_table_col_deposit: "डिपॉज़िट राशि (USDT)",
  earn_table_col_reward: "टोकन रिवॉर्ड",
  earn_example_label: "विस्तृत उदाहरण",
  earn_example_intro:
    "Power या Ultimate Loop Plan में **$1,000** डिपॉज़िट करें → आप **1.20%** टियर में आते हैं → रिवॉर्ड वैल्यू **$12.00** → टोकन की संख्या फिर डिपॉज़िट के सटीक क्षण के लाइव मार्केट प्राइस पर लॉक हो जाती है।",
  earn_example_your_share: "आपको:",
  earn_example_referrer_share: "आपके रेफरर को:",
  earn_example_footnote:
    "टोकन की संख्या डिपॉज़िट के क्षण में फिक्स हो जाती है, उस सटीक समय के लाइव मार्केट प्राइस के अनुसार गणना की जाती है।",
  earn_additive_note:
    "टोकन रिवॉर्ड्स **एडिटिव** हैं। ये आपकी Power या Ultimate Loop Plan यील्ड के ऊपर पे आउट होते हैं और आपके फिक्स्ड ROI को किसी भी तरह नहीं बदलते। **केवल Power (30-day) और Ultimate (60-day) plans qualify करते हैं** — Sprint और Boost अपना स्टैंडर्ड USDT ROI कमाते हैं, लेकिन टोकन रिवॉर्ड्स नहीं। टोकन रिवॉर्ड्स के लिए न्यूनतम डिपॉज़िट: **$100**।",
  earn_manage_cta: "ऐप में प्रबंधित करें",
  earn_calculator_cta: "संख्याएँ देखें",

  vesting_eyebrow: "वेस्टिंग · मासिक अनलॉक",
  vesting_title: "आपका Leadership रैंक टोकन तेज़ी से अनलॉक करता है",
  vesting_subtitle:
    "आपका मौजूदा TurboLoop Leadership Program रैंक यह तय करता है कि हर महीने आपके वेस्टेड टोकन कितनी जल्दी अनलॉक होते हैं। ऊँचा रैंक = तेज़ अनलॉक। बिना रैंक वाले यूज़र्स के लिए बेस अनलॉक 10%/महीना है; रैंक Legend पर 20%/महीना तक बढ़ते हैं। पहली किस्त डिपॉज़िट पर तुरंत मिलती है। पूरी तरह स्मार्ट कॉन्ट्रैक्ट ऑटोमेटेड — कोई मैनुअल क्लेम नहीं।",
  vesting_table_col_rank: "रैंक",
  vesting_table_col_monthly: "मासिक अनलॉक",
  vesting_table_col_full: "पूर्ण अनलॉक तक महीने",
  vesting_leadership_link_text: "Leadership Program कैसे काम करता है, देखें",

  deflationary_eyebrow: "डिज़ाइन से डिफ़्लेशनरी",
  deflationary_title: "रोज़ाना बायबैक और बर्न",
  deflationary_subtitle:
    "रोज़ाना, प्रोटोकॉल मुख्य TurboLoop प्लेटफ़ॉर्म की एडमिन फीस का 10% उपयोग करके मार्केट से $TURBO खरीदता है और इसे हमेशा के लिए बर्न करता है। स्मार्ट कॉन्ट्रैक्ट ऑटोमेटेड — कोई मैनुअल इंटरवेंशन नहीं।",
  deflationary_flow_label: "यह कैसे फ्लो होता है",
  deflationary_step_fees: "प्रोटोकॉल एडमिन फीस",
  deflationary_step_buyback: "रोज़ाना ऑटोमेटेड बायबैक",
  deflationary_step_burn:
    "स्थायी बर्न — $TURBO की सप्लाई कम होती है",
  deflationary_burn_caption:
    "BuyBack & Burn कॉन्ट्रैक्ट देखें",
  deflationary_bscscan_link: "BscScan पर",
  trade_tax_label: "ट्रेड टैक्स",
  trade_tax_buy_label: "बाय टैक्स",
  trade_tax_sell_label: "सेल टैक्स",
  trade_tax_explainer:
    "ट्रेड टैक्स एडमिन द्वारा कलेक्ट किया जाता है और हर बाय और सेल पर लागू होता है, सभी वेन्यू में (नेटिव स्वैप, PancakeSwap, पेयर से रूट होने वाला कोई भी DEX)।",

  security_eyebrow: "सुरक्षा और पारदर्शिता",
  security_title:
    "फ़ेयर लॉन्च, पूरी तरह ऑन-चेन, कोई एडमिन कीज़ नहीं",
  security_subtitle:
    "हर दावा BscScan पर वेरिफाई किया जा सकता है। किसी भी एड्रेस को कॉपी करने के लिए क्लिक करें; ऑन-चेन देखने के लिए किसी भी लिंक को क्लिक करें।",
  security_lp_label: "100% LP लॉक्ड",
  security_lp_detail:
    "लिक्विडिटी टोकन ऑन-चेन लॉक हैं, पूरी तरह वेरिफायबल।",
  security_lp_link: "LP ट्रांज़ैक्शन देखें",
  security_team_label: "कोई टीम अलोकेशन नहीं",
  security_team_detail:
    "टीम के लिए 0% रिज़र्व। 100% फ़ेयर लॉन्च।",
  security_insider_label: "कोई इनसाइडर रिज़र्व नहीं",
  security_insider_detail:
    "कोई प्री-माइन नहीं। कोई छिपी हुई अलोकेशन नहीं। पूरी सप्लाई लॉन्च में गई।",
  security_renounce_label: "ओनरशिप रिनाउंस्ड",
  security_renounce_detail:
    "टोकन कॉन्ट्रैक्ट और बायबैक कॉन्ट्रैक्ट दोनों की ओनरशिप ऑन-चेन बर्न कर दी गई है।",
  security_renounce_link: "रिनाउंस ट्रांज़ैक्शन देखें",
  security_token_contract_label: "टोकन कॉन्ट्रैक्ट",
  security_pair_label: "USDT/TURBO पेयर",
  security_buyback_contract_label: "बायबैक कॉन्ट्रैक्ट",

  trade_eyebrow: "खरीदें और बेचें",
  trade_title: "ट्रेड करने के दो तरीके",
  trade_subtitle:
    "TurboLoop नेटिव स्वैप सबसे तेज़ रास्ता है। PancakeSwap उन यूज़र्स के लिए एक एडवांस्ड विकल्प के रूप में समर्थित है जो सीधे DEX पर ट्रेड करना पसंद करते हैं। 1% बाय / 2% सेल ट्रेड टैक्स दोनों वेन्यू पर लागू होता है।",
  trade_native_badge: "अनुशंसित",
  trade_native_title: "TurboLoop नेटिव स्वैप",
  trade_native_subtitle:
    "$TURBO को सीधे TurboLoop dApp के अंदर ट्रेड करें। वन-क्लिक USDT ↔ TURBO स्वैप, आपके डिपॉज़िट और रिवॉर्ड्स डैशबोर्ड के साथ इंटीग्रेटेड।",
  trade_native_buy_cta: "खरीदें",
  trade_native_sell_cta: "बेचें",
  trade_pancake_badge: "एडवांस्ड",
  trade_pancake_title: "PancakeSwap",
  trade_pancake_subtitle:
    "अगर आप सीधे DEX पर ट्रेड करना पसंद करते हैं, तो $TURBO PancakeSwap V2 पर उपलब्ध है — वही लिक्विडिटी पूल जो नेटिव स्वैप को पावर देता है।",
  trade_pancake_cta: "PancakeSwap में खोलें",
  trade_pancake_chart_cta: "चार्ट",
};

// ── Bahasa Indonesia (conversational Tokocrypto-blog tone) ────────

const id: TokenPageStrings = {
  hero_eyebrow: "Token reward asli · BSC",
  hero_title_pre: "Dapatkan ",
  hero_title_post: " di setiap deposit.",
  hero_subtitle_pre:
    "Lapisan reward ekstra di atas yield TurboLoop tetap milikmu — tanpa pengaruh apa pun terhadap performa protokol.",
  hero_subtitle_supply: "1.000.000 total supply.",
  hero_subtitle_post:
    " 100% LP locked. Tidak ada alokasi tim. Tidak ada cadangan insider.",
  hero_cta_buy: "Beli",
  hero_cta_chart: "Lihat chart di DexScreener",
  hero_cta_bscscan: "Lihat kontrak di BscScan",

  stats_price_label: "Harga",
  stats_change_label: "Perubahan 24j",
  stats_volume_label: "Volume 24j",
  stats_liquidity_label: "Likuiditas",

  earn_eyebrow: "Dapatkan di setiap deposit Power atau Ultimate",
  earn_title: "Cara mendapatkan $TURBO",
  earn_subtitle:
    "Deposit USDT ke Loop Plan Power (30 hari) atau Ultimate (60 hari). Dapatkan $TURBO sebagai bonus — persentase dari nilai deposit, dibagi 70% untukmu dan 30% untuk referrer-mu. Deposit Sprint dan Boost tidak memenuhi syarat.",
  earn_table_col_deposit: "Jumlah Deposit (USDT)",
  earn_table_col_reward: "Reward Token",
  earn_example_label: "Contoh konkret",
  earn_example_intro:
    "Deposit **$1.000** ke Power atau Ultimate Loop Plan → masuk ke tier **1,20%** → nilai reward **$12,00** → jumlah token kemudian dikunci pada harga pasar live di saat deposit itu juga.",
  earn_example_your_share: "untukmu:",
  earn_example_referrer_share: "untuk referrer-mu:",
  earn_example_footnote:
    "Jumlah token dikunci pada saat deposit, dihitung terhadap harga pasar live di waktu itu juga.",
  earn_additive_note:
    "Reward token bersifat **aditif**. Dibayarkan di atas yield Power atau Ultimate Loop Plan-mu dan tidak mengubah ROI tetap milikmu sedikit pun. **Hanya plan Power (30 hari) dan Ultimate (60 hari) yang memenuhi syarat** — Sprint dan Boost tetap mendapatkan ROI USDT standar mereka tapi tidak ada reward token. Deposit minimum untuk reward token: **$100**.",
  earn_manage_cta: "Kelola di App",
  earn_calculator_cta: "Hitung angkanya",

  vesting_eyebrow: "Vesting · unlock bulanan",
  vesting_title: "Rank Leadership-mu membuka token lebih cepat",
  vesting_subtitle:
    "Rank TurboLoop Leadership Program yang sudah kamu miliki menentukan seberapa cepat token vested terbuka setiap bulan. Rank lebih tinggi = unlock lebih cepat. Base unlock 10%/bulan untuk pengguna tanpa rank; rank meningkat hingga 20%/bulan di Legend. Cicilan pertama dibayarkan instan saat deposit. Otomatis penuh oleh smart contract — tanpa klaim manual.",
  vesting_table_col_rank: "Rank",
  vesting_table_col_monthly: "Unlock Bulanan",
  vesting_table_col_full: "Bulan untuk Unlock Penuh",
  vesting_leadership_link_text:
    "Lihat cara kerja Leadership Program",

  deflationary_eyebrow: "Deflasioner sejak desain",
  deflationary_title: "Buyback & burn harian",
  deflationary_subtitle:
    "Setiap hari, protokol menggunakan 10% admin fees dari platform TurboLoop utama untuk membeli $TURBO dari pasar dan membakarnya selamanya. Otomatis penuh oleh smart contract — tanpa intervensi manual.",
  deflationary_flow_label: "Bagaimana alurnya",
  deflationary_step_fees: "Admin fees protokol",
  deflationary_step_buyback: "Buyback otomatis harian",
  deflationary_step_burn:
    "Burn permanen — supply $TURBO berkurang",
  deflationary_burn_caption: "Lihat kontrak BuyBack & Burn di",
  deflationary_bscscan_link: "BscScan",
  trade_tax_label: "Trade tax",
  trade_tax_buy_label: "tax beli",
  trade_tax_sell_label: "tax jual",
  trade_tax_explainer:
    "Trade tax dikumpulkan oleh admin dan berlaku pada setiap pembelian dan penjualan di semua venue (native swap, PancakeSwap, DEX apa pun yang melewati pair).",

  security_eyebrow: "Keamanan & transparansi",
  security_title:
    "Fair launch, sepenuhnya on-chain, tanpa kunci admin",
  security_subtitle:
    "Setiap klaim dapat diverifikasi di BscScan. Klik alamat mana pun untuk menyalinnya; klik link mana pun untuk melihatnya on-chain.",
  security_lp_label: "100% LP Locked",
  security_lp_detail:
    "Liquidity token dikunci on-chain, sepenuhnya dapat diverifikasi.",
  security_lp_link: "Lihat transaksi LP",
  security_team_label: "Tidak ada alokasi tim",
  security_team_detail: "0% disisihkan untuk tim. 100% fair launch.",
  security_insider_label: "Tidak ada cadangan insider",
  security_insider_detail:
    "Tidak ada pre-mine. Tidak ada alokasi tersembunyi. Seluruh supply masuk ke launch.",
  security_renounce_label: "Ownership renounced",
  security_renounce_detail:
    "Kepemilikan kontrak token dan kontrak buyback sama-sama dibakar on-chain.",
  security_renounce_link: "Lihat transaksi renounce",
  security_token_contract_label: "Kontrak token",
  security_pair_label: "Pair USDT/TURBO",
  security_buyback_contract_label: "Kontrak buyback",

  trade_eyebrow: "Beli & jual",
  trade_title: "Dua cara untuk trading",
  trade_subtitle:
    "TurboLoop native swap adalah jalur tercepat. PancakeSwap didukung sebagai opsi advanced untuk pengguna yang lebih suka trading langsung di DEX. Trade tax 1% beli / 2% jual berlaku di kedua venue.",
  trade_native_badge: "Direkomendasikan",
  trade_native_title: "TurboLoop Native Swap",
  trade_native_subtitle:
    "Trade $TURBO langsung di dalam TurboLoop dApp. Swap USDT ↔ TURBO satu klik, terintegrasi dengan dashboard deposit dan reward-mu.",
  trade_native_buy_cta: "Beli",
  trade_native_sell_cta: "Jual",
  trade_pancake_badge: "Advanced",
  trade_pancake_title: "PancakeSwap",
  trade_pancake_subtitle:
    "Jika lebih suka trading langsung di DEX, $TURBO tersedia di PancakeSwap V2 — pool likuiditas yang sama yang memberi daya pada native swap.",
  trade_pancake_cta: "Buka di PancakeSwap",
  trade_pancake_chart_cta: "Chart",
};

export const TOKEN_PAGE_CONTENT: Record<SupportedLang, TokenPageStrings> = {
  en,
  de,
  hi,
  id,
};

export function isSupportedLang(v: string | undefined): v is SupportedLang {
  return v === "en" || v === "de" || v === "hi" || v === "id";
}
