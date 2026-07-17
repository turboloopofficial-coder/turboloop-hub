/**
 * TURBOLOOP MASTER LANGUAGE CONFIGURATION
 * 
 * This is the single source of truth for all language-related properties across the codebase.
 * Adding a new language requires editing ONLY this file and adding the translation JSON.
 */

export type LanguageCode = 
  | "en" | "de" | "hi" | "id" | "th" | "ko" | "lo" | "fr" 
  | "ta" | "la" | "cn" | "es" | "ng" | "it" | "sa" | "kr" 
  | "pk" | "bn" | "tr" | "pt" | "ru" | "ja" | "vi" | "tl"
  | "ms" | "fa" | "uk" | "pl" | "sw" | "ha" | "yo" | "az"
  | "uz" | "kk" | "ne" | "si" | "te" | "mr" | "gu" | "kn"
  | "ml" | "pa" | "my" | "km" | "am" | "ro" | "nl" | "el"
  | "cs" | "hu" | "he"
  | "bg" | "da" | "et" | "fi" | "hr" | "lt" | "lv" | "no" | "sk" | "sl" | "sr" | "sv" | "zu";

export interface LanguageConfig {
  /** The 2-letter DB code used internally (e.g., "en", "hi", "kr") */
  code: LanguageCode;
  /** The next-intl locale code used in URLs (e.g., "en", "hi", "ko") */
  locale: string;
  /** English name of the language */
  name: string;
  /** Native name of the language */
  nativeName: string;
  /** Emoji flag */
  flag: string;
  /** BCP-47 code for hreflang and RSS (e.g., "en-us", "zh-cn") */
  bcp47: string;
  /** Slug suffix for translated blog posts (e.g., "-hi") */
  slugSuffix: string;
  /** RSS feed title */
  rssTitle: string;
  /** RSS feed description */
  rssDescription: string;
  /** Telegram channel identifier (e.g., "telegram_hi"). Null if no dedicated channel. */
  telegramChannel: string | null;
}

export const LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: "en", locale: "en", name: "English", nativeName: "English", flag: "🇬🇧",
    bcp47: "en-us", slugSuffix: "", telegramChannel: "telegram_en",
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Long-form articles on DeFi, yield, security, and the math behind TurboLoop."
  },
  de: {
    code: "de", locale: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪",
    bcp47: "de-de", slugSuffix: "-de", telegramChannel: "telegram_de",
    rssTitle: "Turbo Loop — Redaktion",
    rssDescription: "Langform-Artikel über DeFi, Renditen, Sicherheit und die Mathematik hinter TurboLoop."
  },
  hi: {
    code: "hi", locale: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳",
    bcp47: "hi-in", slugSuffix: "-hi", telegramChannel: "telegram_hi",
    rssTitle: "Turbo Loop — संपादकीय",
    rssDescription: "DeFi, यील्ड, सुरक्षा और TurboLoop के पीछे के गणित पर विस्तृत लेख।"
  },
  id: {
    code: "id", locale: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩",
    bcp47: "id-id", slugSuffix: "-id", telegramChannel: "telegram_id",
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Artikel mendalam tentang DeFi, yield, keamanan, dan matematika di balik TurboLoop."
  },
  th: {
    code: "th", locale: "th", name: "Thai", nativeName: "ภาษาไทย", flag: "🇹🇭",
    bcp47: "th-th", slugSuffix: "-th", telegramChannel: null,
    rssTitle: "Turbo Loop — บทบรรณาธิการ",
    rssDescription: "บทความเชิงลึกเกี่ยวกับ DeFi, ผลตอบแทน, ความปลอดภัย และคณิตศาสตร์เบื้องหลัง TurboLoop."
  },
  ko: {
    code: "ko", locale: "ko", name: "Korean (alt)", nativeName: "한국어 (alt)", flag: "🇰🇷",
    bcp47: "ko-kr", slugSuffix: "-ko", telegramChannel: null,
    rssTitle: "Turbo Loop — 에디토리얼",
    rssDescription: "DeFi, 수익, 보안 및 TurboLoop의 수학에 관한 심층 기사."
  },
  kr: {
    code: "kr", locale: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷",
    bcp47: "ko-kr", slugSuffix: "-kr", telegramChannel: null,
    rssTitle: "Turbo Loop — 에디토리얼",
    rssDescription: "DeFi, 수익, 보안 및 TurboLoop의 수학에 관한 심층 기사."
  },
  lo: {
    code: "lo", locale: "lo", name: "Lao (alt)", nativeName: "ພາສາລາວ (alt)", flag: "🇱🇦",
    bcp47: "lo-la", slugSuffix: "-lo", telegramChannel: null,
    rssTitle: "Turbo Loop — ບົດບັນນາທິການ",
    rssDescription: "ບົດຄວາມລະອຽດກ່ຽວກັບ DeFi, ຜົນຕອບແທນ, ຄວາມປອດໄພ ແລະ ຄະນິດສາດທີ່ຢູ່ເບື້ອງຼັງ TurboLoop."
  },
  la: {
    code: "la", locale: "lo", name: "Lao", nativeName: "ພາສາລາວ", flag: "🇱🇦",
    bcp47: "lo-la", slugSuffix: "-la", telegramChannel: null,
    rssTitle: "Turbo Loop — ບົດບັນນາທິການ",
    rssDescription: "ບົດຄວາມລະອຽດກ່ຽວກັບ DeFi, ຜົນຕອບແທນ, ຄວາມປອດໄພ ແລະ ຄະນິດສາດທີ່ຢູ່ເບື້ອງຼັງ TurboLoop."
  },
  fr: {
    code: "fr", locale: "fr", name: "French", nativeName: "Français", flag: "🇫🇷",
    bcp47: "fr-fr", slugSuffix: "-fr", telegramChannel: null,
    rssTitle: "Turbo Loop — Éditorial",
    rssDescription: "Articles approfondis sur la DeFi, le rendement, la sécurité et les mathématiques derrière TurboLoop."
  },
  ta: {
    code: "ta", locale: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳",
    bcp47: "ta-in", slugSuffix: "-ta", telegramChannel: null,
    rssTitle: "Turbo Loop — தலையங்கம்",
    rssDescription: "DeFi, வருமானம், பாதுகாப்பு மற்றும் TurboLoop பின்னணியிலுள்ள கணிதம் பற்றிய ஆழமான கட்டுரைகள்."
  },
  cn: {
    code: "cn", locale: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳",
    bcp47: "zh-cn", slugSuffix: "-cn", telegramChannel: null,
    rssTitle: "Turbo Loop — 社论",
    rssDescription: "关于DeFi、收益、安全以及TurboLoop背后数学的深度文章。"
  },
  es: {
    code: "es", locale: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸",
    bcp47: "es-es", slugSuffix: "-es", telegramChannel: null,
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Artículos en profundidad sobre DeFi, rendimiento, seguridad y las matemáticas detrás de TurboLoop."
  },
  ng: {
    code: "ng", locale: "pcm", name: "Nigerian Pidgin", nativeName: "Naija", flag: "🇳🇬",
    bcp47: "en-ng", slugSuffix: "-ng", telegramChannel: null,
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Long articles about DeFi, yield, security, and the math wey dey behind TurboLoop."
  },
  it: {
    code: "it", locale: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹",
    bcp47: "it-it", slugSuffix: "-it", telegramChannel: null,
    rssTitle: "Turbo Loop — Editoriale",
    rssDescription: "Articoli approfonditi su DeFi, rendimento, sicurezza e la matematica dietro TurboLoop."
  },
  sa: {
    code: "sa", locale: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦",
    bcp47: "ar-sa", slugSuffix: "-sa", telegramChannel: null,
    rssTitle: "Turbo Loop — افتتاحية",
    rssDescription: "مقالات متعمقة حول التمويل اللامركزي والعائد والأمان والرياضيات وراء TurboLoop."
  },
  pk: {
    code: "pk", locale: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰",
    bcp47: "ur-pk", slugSuffix: "-pk", telegramChannel: null,
    rssTitle: "Turbo Loop — اداریہ",
    rssDescription: "DeFi، منافع، سیکیورٹی اور TurboLoop کے پیچھے ریاضی پر گہرائی سے مضامین۔"
  },
  bn: {
    code: "bn", locale: "bn", name: "Bangla", nativeName: "বাংলা", flag: "🇧🇩",
    bcp47: "bn-bd", slugSuffix: "-bn", telegramChannel: "telegram_bn",
    rssTitle: "Turbo Loop — সম্পাদকীয়",
    rssDescription: "DeFi, ইল্ড, নিরাপত্তা এবং TurboLoop এর পেছনের গণিত নিয়ে বিস্তারিত প্রবন্ধ।"
  },
  tr: {
    code: "tr", locale: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷",
    bcp47: "tr-tr", slugSuffix: "-tr", telegramChannel: null,
    rssTitle: "Turbo Loop — Editoryal",
    rssDescription: "DeFi, getiri, güvenlik ve TurboLoop'un arkasındaki matematik hakkında derinlemesine makaleler."
  },
  pt: {
    code: "pt", locale: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷",
    bcp47: "pt-br", slugSuffix: "-pt", telegramChannel: null,
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Artigos aprofundados sobre DeFi, rendimento, segurança e a matemática por trás do TurboLoop."
  },
  ru: {
    code: "ru", locale: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺",
    bcp47: "ru-ru", slugSuffix: "-ru", telegramChannel: null,
    rssTitle: "Turbo Loop — Редакция",
    rssDescription: "Подробные статьи о DeFi, доходности, безопасности и математике TurboLoop."
  },
  ja: {
    code: "ja", locale: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵",
    bcp47: "ja-jp", slugSuffix: "-ja", telegramChannel: null,
    rssTitle: "Turbo Loop — エディトリアル",
    rssDescription: "DeFi、利回り、セキュリティ、TurboLoopの数学に関する詳細記事。"
  },
  vi: {
    code: "vi", locale: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳",
    bcp47: "vi-vn", slugSuffix: "-vi", telegramChannel: null,
    rssTitle: "Turbo Loop — Biên tập",
    rssDescription: "Bài viết chuyên sâu về DeFi, lợi suất, bảo mật và toán học đằng sau TurboLoop."
  },
  tl: {
    code: "tl", locale: "tl", name: "Filipino", nativeName: "Filipino", flag: "🇵🇭",
    bcp47: "tl-ph", slugSuffix: "-tl", telegramChannel: null,
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Mga malalim na artikulo tungkol sa DeFi, yield, seguridad, at matematika sa likod ng TurboLoop."
  },
  ms: {
    code: "ms", locale: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾",
    bcp47: "ms-my", slugSuffix: "-ms", telegramChannel: null,
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Artikel mendalam tentang DeFi, hasil, keselamatan dan matematik di sebalik TurboLoop."
  },
  fa: {
    code: "fa", locale: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷",
    bcp47: "fa-ir", slugSuffix: "-fa", telegramChannel: null,
    rssTitle: "Turbo Loop — سرمقاله",
    rssDescription: "مقالات عمیق درباره DeFi، بازده، امنیت و ریاضیات پشت TurboLoop."
  },
  uk: {
    code: "uk", locale: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦",
    bcp47: "uk-ua", slugSuffix: "-uk", telegramChannel: null,
    rssTitle: "Turbo Loop — Редакція",
    rssDescription: "Детальні статті про DeFi, дохідність, безпеку та математику TurboLoop."
  },
  pl: {
    code: "pl", locale: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱",
    bcp47: "pl-pl", slugSuffix: "-pl", telegramChannel: null,
    rssTitle: "Turbo Loop — Redakcja",
    rssDescription: "Szczegółowe artykuły o DeFi, zyskach, bezpieczeństwie i matematyce TurboLoop."
  },
  sw: {
    code: "sw", locale: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪",
    bcp47: "sw-ke", slugSuffix: "-sw", telegramChannel: null,
    rssTitle: "Turbo Loop — Uhariri",
    rssDescription: "Makala ya kina kuhusu DeFi, mavuno, usalama na hesabu nyuma ya TurboLoop."
  },
  ha: {
    code: "ha", locale: "ha", name: "Hausa", nativeName: "Hausa", flag: "🇳🇬",
    bcp47: "ha-ng", slugSuffix: "-ha", telegramChannel: null,
    rssTitle: "Turbo Loop — Edita",
    rssDescription: "Labaran cikakku game da DeFi, riba, tsaro da lissafin da ke bayan TurboLoop."
  },
  yo: {
    code: "yo", locale: "yo", name: "Yoruba", nativeName: "Yorùbá", flag: "🇳🇬",
    bcp47: "yo-ng", slugSuffix: "-yo", telegramChannel: null,
    rssTitle: "Turbo Loop — Àtúnṣe",
    rssDescription: "Àwọn àpilẹ̀kọ jíjinlẹ̀ nípa DeFi, èrè, ààbò àti ìṣirò tó wà lẹ́yìn TurboLoop."
  },
  az: {
    code: "az", locale: "az", name: "Azerbaijani", nativeName: "Azərbaycan", flag: "🇦🇿",
    bcp47: "az-az", slugSuffix: "-az", telegramChannel: null,
    rssTitle: "Turbo Loop — Redaksiya",
    rssDescription: "DeFi, gəlir, təhlükəsizlik və TurboLoop arxasındakı riyaziyyat haqqında ətraflı məqalələr."
  },
  uz: {
    code: "uz", locale: "uz", name: "Uzbek", nativeName: "Oʻzbekcha", flag: "🇺🇿",
    bcp47: "uz-uz", slugSuffix: "-uz", telegramChannel: null,
    rssTitle: "Turbo Loop — Tahririyat",
    rssDescription: "DeFi, daromad, xavfsizlik va TurboLoop ortidagi matematika haqida batafsil maqolalar."
  },
  kk: {
    code: "kk", locale: "kk", name: "Kazakh", nativeName: "Қазақша", flag: "🇰🇿",
    bcp47: "kk-kz", slugSuffix: "-kk", telegramChannel: null,
    rssTitle: "Turbo Loop — Редакция",
    rssDescription: "DeFi, табыс, қауіпсіздік және TurboLoop артындағы математика туралы терең мақалалар."
  },
  ne: {
    code: "ne", locale: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇳🇵",
    bcp47: "ne-np", slugSuffix: "-ne", telegramChannel: null,
    rssTitle: "Turbo Loop — सम्पादकीय",
    rssDescription: "DeFi, उपज, सुरक्षा र TurboLoop पछाडिको गणित बारे गहिरा लेखहरू।"
  },
  si: {
    code: "si", locale: "si", name: "Sinhala", nativeName: "සිංහල", flag: "🇱🇰",
    bcp47: "si-lk", slugSuffix: "-si", telegramChannel: null,
    rssTitle: "Turbo Loop — සංස්කාරක",
    rssDescription: "DeFi, ප්‍රතිලාභ, ආරක්ෂාව සහ TurboLoop පිටුපස ගණිතය පිළිබඳ ගැඹුරු ලිපි."
  },
  te: {
    code: "te", locale: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳",
    bcp47: "te-in", slugSuffix: "-te", telegramChannel: null,
    rssTitle: "Turbo Loop — సంపాదకీయం",
    rssDescription: "DeFi, రాబడి, భద్రత మరియు TurboLoop వెనుక గణితం గురించి లోతైన వ్యాసాలు."
  },
  mr: {
    code: "mr", locale: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳",
    bcp47: "mr-in", slugSuffix: "-mr", telegramChannel: null,
    rssTitle: "Turbo Loop — संपादकीय",
    rssDescription: "DeFi, उत्पन्न, सुरक्षा आणि TurboLoop मागील गणित यावरील सखोल लेख."
  },
  gu: {
    code: "gu", locale: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳",
    bcp47: "gu-in", slugSuffix: "-gu", telegramChannel: null,
    rssTitle: "Turbo Loop — સંપાદકીય",
    rssDescription: "DeFi, ઉપજ, સુરક્ષા અને TurboLoop પાછળના ગણિત વિશે ઊંડાણપૂર્વક લેખો."
  },
  kn: {
    code: "kn", locale: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳",
    bcp47: "kn-in", slugSuffix: "-kn", telegramChannel: null,
    rssTitle: "Turbo Loop — ಸಂಪಾದಕೀಯ",
    rssDescription: "DeFi, ಇಳುವರಿ, ಭದ್ರತೆ ಮತ್ತು TurboLoop ಹಿಂದಿನ ಗಣಿತದ ಕುರಿತು ಆಳವಾದ ಲೇಖನಗಳು."
  },
  ml: {
    code: "ml", locale: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳",
    bcp47: "ml-in", slugSuffix: "-ml", telegramChannel: null,
    rssTitle: "Turbo Loop — എഡിറ്റോറിയൽ",
    rssDescription: "DeFi, വരുമാനം, സുരക്ഷ, TurboLoop-ന് പിന്നിലെ ഗണിതം എന്നിവയെക്കുറിച്ചുള്ള ആഴത്തിലുള്ള ലേഖനങ്ങൾ."
  },
  pa: {
    code: "pa", locale: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳",
    bcp47: "pa-in", slugSuffix: "-pa", telegramChannel: null,
    rssTitle: "Turbo Loop — ਸੰਪਾਦਕੀ",
    rssDescription: "DeFi, ਉਪਜ, ਸੁਰੱਖਿਆ ਅਤੇ TurboLoop ਪਿੱਛੇ ਦੀ ਗਣਿਤ ਬਾਰੇ ਡੂੰਘੇ ਲੇਖ।"
  },
  my: {
    code: "my", locale: "my", name: "Burmese", nativeName: "မြန်မာ", flag: "🇲🇲",
    bcp47: "my-mm", slugSuffix: "-my", telegramChannel: null,
    rssTitle: "Turbo Loop — အယ်ဒီတာ",
    rssDescription: "DeFi, အမြတ်, လုံခြုံရေးနှင့် TurboLoop နောက်ကွယ်ရှိ သင်္ချာအကြောင်း အသေးစိတ်ဆောင်းပါးများ။"
  },
  km: {
    code: "km", locale: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ", flag: "🇰🇭",
    bcp47: "km-kh", slugSuffix: "-km", telegramChannel: null,
    rssTitle: "Turbo Loop — វិចារណកថា",
    rssDescription: "អត្ថបទស៊ីជម្រៅអំពី DeFi ទិន្នផល សុវត្ថិភាព និងគណិតវិទ្យានៅពីក្រោយ TurboLoop។"
  },
  am: {
    code: "am", locale: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹",
    bcp47: "am-et", slugSuffix: "-am", telegramChannel: null,
    rssTitle: "Turbo Loop — ዝግጅት",
    rssDescription: "ስለ DeFi፣ ትርፍ፣ ደህንነት እና ከTurboLoop በስተጀርባ ያለው ሂሳብ ጥልቅ ጽሑፎች።"
  },
  ro: {
    code: "ro", locale: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴",
    bcp47: "ro-ro", slugSuffix: "-ro", telegramChannel: null,
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Articole aprofundate despre DeFi, randament, securitate și matematica din spatele TurboLoop."
  },
  nl: {
    code: "nl", locale: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱",
    bcp47: "nl-nl", slugSuffix: "-nl", telegramChannel: null,
    rssTitle: "Turbo Loop — Redactie",
    rssDescription: "Diepgaande artikelen over DeFi, rendement, beveiliging en de wiskunde achter TurboLoop."
  },
  el: {
    code: "el", locale: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷",
    bcp47: "el-gr", slugSuffix: "-el", telegramChannel: null,
    rssTitle: "Turbo Loop — Σύνταξη",
    rssDescription: "Εις βάθος άρθρα για DeFi, απόδοση, ασφάλεια και τα μαθηματικά πίσω από το TurboLoop."
  },
  cs: {
    code: "cs", locale: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿",
    bcp47: "cs-cz", slugSuffix: "-cs", telegramChannel: null,
    rssTitle: "Turbo Loop — Redakce",
    rssDescription: "Podrobné články o DeFi, výnosech, bezpečnosti a matematice za TurboLoop."
  },
  hu: {
    code: "hu", locale: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺",
    bcp47: "hu-hu", slugSuffix: "-hu", telegramChannel: null,
    rssTitle: "Turbo Loop — Szerkesztőség",
    rssDescription: "Mélyreható cikkek a DeFi-ről, hozamról, biztonságról és a TurboLoop mögötti matematikáról."
  },
  he: {
    code: "he", locale: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱",
    bcp47: "he-il", slugSuffix: "-he", telegramChannel: null,
    rssTitle: "Turbo Loop — מערכת",
    rssDescription: "מאמרים מעמיקים על DeFi, תשואה, אבטחה והמתמטיקה מאחורי TurboLoop."
  },
  bg: {
    code: "bg", locale: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬",
    bcp47: "bg-bg", slugSuffix: "-bg", telegramChannel: null,
    rssTitle: "Turbo Loop — Редакция",
    rssDescription: "Задълбочени статии за DeFi, доходност, сигурност и математиката зад TurboLoop."
  },
  da: {
    code: "da", locale: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰",
    bcp47: "da-dk", slugSuffix: "-da", telegramChannel: null,
    rssTitle: "Turbo Loop — Redaktion",
    rssDescription: "Dybdegående artikler om DeFi, afkast, sikkerhed og matematikken bag TurboLoop."
  },
  et: {
    code: "et", locale: "et", name: "Estonian", nativeName: "Eesti", flag: "🇪🇪",
    bcp47: "et-ee", slugSuffix: "-et", telegramChannel: null,
    rssTitle: "Turbo Loop — Toimetus",
    rssDescription: "Põhjalikud artiklid DeFi, tootluse, turvalisuse ja TurboLoopi taga oleva matemaatika kohta."
  },
  fi: {
    code: "fi", locale: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮",
    bcp47: "fi-fi", slugSuffix: "-fi", telegramChannel: null,
    rssTitle: "Turbo Loop — Toimitus",
    rssDescription: "Syvälliset artikkelit DeFistä, tuotoista, turvallisuudesta ja TurboLoopin takana olevasta matematiikasta."
  },
  hr: {
    code: "hr", locale: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷",
    bcp47: "hr-hr", slugSuffix: "-hr", telegramChannel: null,
    rssTitle: "Turbo Loop — Uredništvo",
    rssDescription: "Detaljni članci o DeFi-ju, prinosima, sigurnosti i matematici iza TurboLoopa."
  },
  lt: {
    code: "lt", locale: "lt", name: "Lithuanian", nativeName: "Lietuvių", flag: "🇱🇹",
    bcp47: "lt-lt", slugSuffix: "-lt", telegramChannel: null,
    rssTitle: "Turbo Loop — Redakcija",
    rssDescription: "Išsamūs straipsniai apie DeFi, pajamingumą, saugumą ir matematiką už TurboLoop."
  },
  lv: {
    code: "lv", locale: "lv", name: "Latvian", nativeName: "Latviešu", flag: "🇱🇻",
    bcp47: "lv-lv", slugSuffix: "-lv", telegramChannel: null,
    rssTitle: "Turbo Loop — Redakcija",
    rssDescription: "Padziļināti raksti par DeFi, ienesīgumu, drošību un matemātiku aiz TurboLoop."
  },
  no: {
    code: "no", locale: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴",
    bcp47: "no-no", slugSuffix: "-no", telegramChannel: null,
    rssTitle: "Turbo Loop — Redaksjon",
    rssDescription: "Dyptgående artikler om DeFi, avkastning, sikkerhet og matematikken bak TurboLoop."
  },
  sk: {
    code: "sk", locale: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰",
    bcp47: "sk-sk", slugSuffix: "-sk", telegramChannel: null,
    rssTitle: "Turbo Loop — Redakcia",
    rssDescription: "Podrobné články o DeFi, výnosoch, bezpečnosti a matematike za TurboLoop."
  },
  sl: {
    code: "sl", locale: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮",
    bcp47: "sl-si", slugSuffix: "-sl", telegramChannel: null,
    rssTitle: "Turbo Loop — Uredništvo",
    rssDescription: "Poglobljeni članki o DeFi, donosnosti, varnosti in matematiki za TurboLoop."
  },
  sr: {
    code: "sr", locale: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸",
    bcp47: "sr-rs", slugSuffix: "-sr", telegramChannel: null,
    rssTitle: "Turbo Loop — Редакција",
    rssDescription: "Детаљни чланци о DeFi-ју, приносима, безбедности и математици иза TurboLoop-а."
  },
  sv: {
    code: "sv", locale: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪",
    bcp47: "sv-se", slugSuffix: "-sv", telegramChannel: null,
    rssTitle: "Turbo Loop — Redaktion",
    rssDescription: "Djupgående artiklar om DeFi, avkastning, säkerhet och matematiken bakom TurboLoop."
  },
  zu: {
    code: "zu", locale: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦",
    bcp47: "zu-za", slugSuffix: "-zu", telegramChannel: null,
    rssTitle: "Turbo Loop — Uhlelo",
    rssDescription: "Izindatshana ezijulile mayelana ne-DeFi, inzuzo, ukuphepha kanye nezibalo ezimuva kwe-TurboLoop."
  }
};

/** Ordered list of languages for UI rendering (English first, then alphabetical or priority) */
export const LANGUAGE_ORDER: LanguageCode[] = [
  "en", "fr", "es", "pt", "de", "it", "nl", "ro", "el", "cs", "hu", "pl", "ru", "uk",
  "hi", "ta", "bn", "te", "mr", "gu", "kn", "ml", "pa", "ne", "si",
  "th", "vi", "ja", "ms", "tl", "km", "my", "id",
  "kr", "la", "cn", "sa", "pk",
  "tr", "az", "uz", "kk", "fa", "he",
  "sw", "ha", "yo", "am", "ng",
  "bg", "da", "et", "fi", "hr", "lt", "lv", "no", "sk", "sl", "sr", "sv", "zu"
  ];

/** Helper to get the base hreflang (e.g., "en-us" -> "en") */
export function getHreflang(code: LanguageCode): string {
  return LANGUAGES[code].bcp47.split("-")[0];
}
