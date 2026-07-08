// Multi-language "Shorts / Reels" data — 4 tutorial videos × 15 languages.
// Audio for each language is AI-dubbed (gTTS) from the English originals.
// DE and ID use the original human-recorded voiceovers.
// Lao (lo) uses English audio as Lao TTS is not widely available.
// Thumbnails: language-specific for all 15 languages × 4 videos (60 total).
// Thumbnail CDN path: reel-thumbs/{lang}/{video_id}.png

export type ReelLang =
  | "en" | "th" | "ko" | "lo" | "hi" | "ta"
  | "ar" | "zh" | "it" | "ur" | "fr" | "es"
  | "pcm" | "de" | "id";

type LocalizedString = Partial<Record<ReelLang, string>>;

interface ReelDef {
  id: string;
  titles: LocalizedString;
  descriptions: LocalizedString;
  hashtags: LocalizedString;
}

const REEL_DEFS: ReelDef[] = [
  {
    id: "v1-withdrawal",
    titles: {
      en: "How to Withdraw via Smart Contract on BSC",
      th: "วิธีถอนเงินผ่าน Smart Contract บน BSC",
      ko: "BSC 스마트 컨트랙트를 통한 출금 방법",
      lo: "ວິທີຖອນເງິນຜ່ານ Smart Contract ໃນ BSC",
      hi: "BSC पर Smart Contract के ज़रिए Withdrawal कैसे करें",
      ta: "BSC-ல் Smart Contract மூலம் பணம் எடுப்பது எப்படி",
      ar: "كيفية السحب عبر العقد الذكي على BSC",
      zh: "如何通过BSC智能合约提款",
      it: "Come Prelevare tramite Smart Contract su BSC",
      ur: "BSC پر Smart Contract کے ذریعے رقم نکالنے کا طریقہ",
      fr: "Comment Retirer via Smart Contract sur BSC",
      es: "Cómo Retirar via Smart Contract en BSC",
      pcm: "How to Withdraw for BSC Smart Contract",
      de: "Wie man über Smart Contract auf BSC abhebt",
      id: "Cara Menarik Dana via Smart Contract di BSC",
    },
    descriptions: {
      en: "Your funds. Your control. Always on-chain. Withdraw from TurboLoop directly through the BSC smart contract — no website needed.",
      th: "เงินของคุณ การควบคุมของคุณ บน blockchain ตลอดเวลา ถอนเงินจาก TurboLoop โดยตรงผ่าน BSC smart contract — ไม่ต้องใช้เว็บไซต์",
      ko: "당신의 자금. 당신의 통제. 항상 온체인. BSC 스마트 컨트랙트를 통해 TurboLoop에서 직접 출금하세요 — 웹사이트 필요 없음.",
      lo: "ເງິນຂອງທ່ານ. ການຄວບຄຸມຂອງທ່ານ. ສະເໝີຢູ່ on-chain. ຖອນເງິນຈາກ TurboLoop ໂດຍກົງຜ່ານ BSC smart contract.",
      hi: "आपके फंड। आपका नियंत्रण। हमेशा ऑन-चेन। BSC स्मार्ट कॉन्ट्रैक्ट के ज़रिए सीधे TurboLoop से निकासी करें — कोई वेबसाइट की ज़रूरत नहीं।",
      ta: "உங்கள் நிதி. உங்கள் கட்டுப்பாடு. எப்போதும் on-chain. BSC smart contract மூலம் நேரடியாக TurboLoop-இலிருந்து பணம் எடுங்கள்.",
      ar: "أموالك. سيطرتك. دائماً على السلسلة. اسحب من TurboLoop مباشرةً عبر العقد الذكي BSC — لا حاجة لموقع ويب.",
      zh: "您的资金。您的控制。始终在链上。直接通过BSC智能合约从TurboLoop提款——无需网站。",
      it: "I tuoi fondi. Il tuo controllo. Sempre on-chain. Preleva da TurboLoop direttamente tramite lo smart contract BSC — nessun sito web necessario.",
      ur: "آپ کے فنڈز۔ آپ کا کنٹرول۔ ہمیشہ آن چین۔ BSC سمارٹ کنٹریکٹ کے ذریعے TurboLoop سے براہ راست نکاسی کریں۔",
      fr: "Vos fonds. Votre contrôle. Toujours on-chain. Retirez de TurboLoop directement via le smart contract BSC — aucun site web nécessaire.",
      es: "Tus fondos. Tu control. Siempre on-chain. Retira de TurboLoop directamente a través del smart contract de BSC — sin necesidad de sitio web.",
      pcm: "Your money. Your control. Always on-chain. Withdraw from TurboLoop directly through BSC smart contract — no website needed.",
      de: "Ihre Gelder. Ihre Kontrolle. Immer on-chain. Heben Sie direkt über den BSC Smart Contract ab — keine Website nötig.",
      id: "Dana Anda. Kendali Anda. Selalu on-chain. Tarik dana langsung melalui smart contract BSC — tanpa perlu website.",
    },
    hashtags: {
      en: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      th: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      ko: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      lo: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      hi: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      ta: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      ar: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      zh: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      it: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      ur: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      fr: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      es: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      pcm: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      de: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      id: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
    },
  },
  {
    id: "v2-investment",
    titles: {
      en: "Investment Returns — 30-Day Loop Completed",
      th: "ผลตอบแทนการลงทุน — Loop 30 วันเสร็จสิ้น",
      ko: "투자 수익 — 30일 루프 완료",
      lo: "ຜົນຕອບແທນການລົງທຶນ — Loop 30 ວັນສຳເລັດ",
      hi: "निवेश रिटर्न — 30-दिन का Loop पूरा हुआ",
      ta: "முதலீட்டு வருமானம் — 30 நாள் Loop முடிந்தது",
      ar: "عوائد الاستثمار — اكتمال الحلقة لمدة 30 يومًا",
      zh: "投资回报 — 30天循环完成",
      it: "Rendimenti dell'Investimento — Loop di 30 Giorni Completato",
      ur: "سرمایہ کاری کا منافع — 30 دن کا Loop مکمل",
      fr: "Rendements d'Investissement — Boucle de 30 Jours Complétée",
      es: "Rendimientos de Inversión — Loop de 30 Días Completado",
      pcm: "Investment Returns — 30-Day Loop Don Finish",
      de: "Investitionsrenditen — 30-Tage-Loop abgeschlossen",
      id: "Hasil Investasi — Loop 30 Hari Selesai",
    },
    descriptions: {
      en: "30-Day Loop COMPLETED. The returns are in. Full breakdown: daily returns, compounding strategy, and how to claim your rewards.",
      th: "Loop 30 วัน เสร็จสิ้นแล้ว ผลตอบแทนมาแล้ว รายละเอียดครบ: ผลตอบแทนรายวัน กลยุทธ์การทบต้น และวิธีรับรางวัล",
      ko: "30일 루프 완료. 수익이 들어왔습니다. 전체 분석: 일일 수익, 복리 전략, 보상 청구 방법.",
      lo: "Loop 30 ວັນ ສຳເລັດແລ້ວ. ຜົນຕອບແທນມາແລ້ວ. ລາຍລະອຽດຄົບ: ຜົນຕອບແທນປະຈຳວັນ, ກົນລະຍຸດ compounding.",
      hi: "30-दिन का Loop पूरा हुआ। रिटर्न आ गए। पूरा विश्लेषण: दैनिक रिटर्न, कंपाउंडिंग रणनीति, और रिवार्ड कैसे क्लेम करें।",
      ta: "30 நாள் Loop முடிந்தது. வருமானம் வந்தது. முழு விவரம்: தினசரி வருமானம், compounding உத்தி, பரிசு எப்படி பெறுவது.",
      ar: "اكتملت حلقة 30 يومًا. العوائد وصلت. تحليل كامل: العوائد اليومية، استراتيجية المضاعفة، وكيفية المطالبة بمكافآتك.",
      zh: "30天循环完成。收益已到账。完整分析：每日收益、复利策略以及如何领取奖励。",
      it: "Loop di 30 giorni COMPLETATO. I rendimenti sono arrivati. Analisi completa: rendimenti giornalieri, strategia di capitalizzazione e come riscattare i premi.",
      ur: "30 دن کا Loop مکمل ہوا۔ منافع آ گیا۔ مکمل تجزیہ: روزانہ منافع، کمپاؤنڈنگ حکمت عملی، اور انعامات کیسے حاصل کریں۔",
      fr: "Boucle de 30 jours COMPLÉTÉE. Les rendements sont là. Analyse complète : rendements quotidiens, stratégie de capitalisation et comment réclamer vos récompenses.",
      es: "Loop de 30 días COMPLETADO. Los rendimientos están aquí. Análisis completo: rendimientos diarios, estrategia de capitalización y cómo reclamar tus recompensas.",
      pcm: "30-Day Loop don finish. The returns don enter. Full breakdown: daily returns, compounding strategy, and how you go claim your rewards.",
      de: "30-Tage-Loop ABGESCHLOSSEN. Die Renditen sind da. Vollständige Analyse: tägliche Renditen, Compounding-Strategie und Belohnungen einfordern.",
      id: "Loop 30 Hari SELESAI. Hasilnya sudah masuk. Analisis lengkap: pengembalian harian, strategi compounding, dan cara klaim hadiah.",
    },
    hashtags: {
      en: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      th: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      ko: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      lo: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      hi: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      ta: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      ar: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      zh: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      it: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      ur: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      fr: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      es: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      pcm: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      de: "#TurboLoop #KryptoRenditen #DeFi #Automatisierung #ROI",
      id: "#TurboLoop #HasilKripto #DeFi #Otomatisasi #ROI",
    },
  },
  {
    id: "v3-lp-check",
    titles: {
      en: "LP Lock Check — $34.7M Liquidity Verified",
      th: "ตรวจสอบ LP Lock — ยืนยัน $34.7M สภาพคล่อง",
      ko: "LP 잠금 확인 — $34.7M 유동성 검증됨",
      lo: "ກວດສອບ LP Lock — $34.7M ສະພາບຄ່ອງຢືນຢັນ",
      hi: "LP Lock जांच — $34.7M Liquidity सत्यापित",
      ta: "LP Lock சரிபார்ப்பு — $34.7M Liquidity உறுதிப்படுத்தப்பட்டது",
      ar: "فحص قفل LP — تم التحقق من $34.7M سيولة",
      zh: "LP锁定检查 — $34.7M流动性已验证",
      it: "Controllo LP Lock — $34.7M di Liquidità Verificata",
      ur: "LP Lock چیک — $34.7M لیکویڈیٹی تصدیق شدہ",
      fr: "Vérification LP Lock — $34.7M de Liquidité Vérifiée",
      es: "Verificación LP Lock — $34.7M de Liquidez Verificada",
      pcm: "LP Lock Check — $34.7M Liquidity Don Verify",
      de: "LP Lock Prüfung — $34.7M Liquidität verifiziert",
      id: "Cek LP Lock — $34.7M Likuiditas Terverifikasi",
    },
    descriptions: {
      en: "$34.7M Liquidity. 100% Locked. Fully Verified. Learn how to check TurboLoop's LP lock yourself on BscScan and PancakeSwap.",
      th: "$34.7M สภาพคล่อง 100% ล็อค ยืนยันครบถ้วน เรียนรู้วิธีตรวจสอบ LP lock ของ TurboLoop ด้วยตัวเองบน BscScan และ PancakeSwap",
      ko: "$34.7M 유동성. 100% 잠금. 완전히 검증됨. BscScan과 PancakeSwap에서 직접 TurboLoop의 LP 잠금을 확인하는 방법을 알아보세요.",
      lo: "$34.7M ສະພາບຄ່ອງ. 100% ລ໋ອກ. ຢືນຢັນຄົບຖ້ວນ. ຮຽນຮູ້ວິທີກວດສອບ LP lock ຂອງ TurboLoop ດ້ວຍຕົນເອງ.",
      hi: "$34.7M Liquidity। 100% Locked। पूरी तरह सत्यापित। BscScan और PancakeSwap पर TurboLoop का LP lock खुद कैसे जांचें।",
      ta: "$34.7M Liquidity. 100% Locked. முழுமையாக சரிபார்க்கப்பட்டது. BscScan மற்றும் PancakeSwap-ல் TurboLoop-இன் LP lock-ஐ நீங்களே சரிபார்க்க கற்றுக்கொள்ளுங்கள்.",
      ar: "$34.7M سيولة. مقفلة 100%. تم التحقق الكامل. تعلم كيفية التحقق من قفل LP لـ TurboLoop بنفسك على BscScan و PancakeSwap.",
      zh: "$34.7M流动性。100%锁定。完全验证。了解如何在BscScan和PancakeSwap上自行检查TurboLoop的LP锁定。",
      it: "$34.7M di Liquidità. 100% Bloccata. Completamente Verificata. Scopri come controllare tu stesso il LP lock di TurboLoop su BscScan e PancakeSwap.",
      ur: "$34.7M لیکویڈیٹی۔ 100% لاک۔ مکمل تصدیق شدہ۔ BscScan اور PancakeSwap پر TurboLoop کا LP lock خود کیسے چیک کریں۔",
      fr: "$34.7M de Liquidité. 100% Verrouillée. Entièrement Vérifiée. Apprenez à vérifier vous-même le LP lock de TurboLoop sur BscScan et PancakeSwap.",
      es: "$34.7M de Liquidez. 100% Bloqueada. Completamente Verificada. Aprende a verificar tú mismo el LP lock de TurboLoop en BscScan y PancakeSwap.",
      pcm: "$34.7M Liquidity. 100% Locked. Fully Verified. Learn how you go check TurboLoop LP lock yourself for BscScan and PancakeSwap.",
      de: "$34.7M Liquidität. 100% gesperrt. Vollständig verifiziert. Prüfen Sie TurboLoops LP-Lock selbst auf BscScan und PancakeSwap.",
      id: "$34.7M Likuiditas. 100% Terkunci. Sepenuhnya Terverifikasi. Periksa LP lock TurboLoop sendiri di BscScan dan PancakeSwap.",
    },
    hashtags: {
      en: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      th: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      ko: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      lo: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      hi: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      ta: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      ar: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      zh: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      it: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      ur: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      fr: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      es: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      pcm: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      de: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      id: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
    },
  },
  {
    id: "v4-deposit",
    titles: {
      en: "How to Deposit via Smart Contract on BSC",
      th: "วิธีฝากเงินผ่าน Smart Contract บน BSC",
      ko: "BSC 스마트 컨트랙트를 통한 입금 방법",
      lo: "ວິທີຝາກເງິນຜ່ານ Smart Contract ໃນ BSC",
      hi: "BSC पर Smart Contract के ज़रिए Deposit कैसे करें",
      ta: "BSC-ல் Smart Contract மூலம் பணம் செலுத்துவது எப்படி",
      ar: "كيفية الإيداع عبر العقد الذكي على BSC",
      zh: "如何通过BSC智能合约存款",
      it: "Come Depositare tramite Smart Contract su BSC",
      ur: "BSC پر Smart Contract کے ذریعے رقم جمع کرنے کا طریقہ",
      fr: "Comment Déposer via Smart Contract sur BSC",
      es: "Cómo Depositar via Smart Contract en BSC",
      pcm: "How to Deposit for BSC Smart Contract",
      de: "Wie man über Smart Contract auf BSC einzahlt",
      id: "Cara Deposit via Smart Contract di BSC",
    },
    descriptions: {
      en: "Step-by-step: connect your wallet, choose your plan, and deposit USDT directly into the TurboLoop smart contract on BSC — no middleman, no trust required.",
      th: "ทีละขั้นตอน: เชื่อมต่อกระเป๋าเงิน เลือกแผน และฝาก USDT โดยตรงเข้า TurboLoop smart contract บน BSC — ไม่มีตัวกลาง ไม่ต้องเชื่อใจใคร",
      ko: "단계별: 지갑 연결, 플랜 선택, BSC의 TurboLoop 스마트 컨트랙트에 USDT 직접 입금 — 중개인 없음, 신뢰 불필요.",
      lo: "ທີລະຂັ້ນຕອນ: ເຊື່ອມຕໍ່ wallet, ເລືອກແຜນ, ແລະຝາກ USDT ໂດຍກົງເຂົ້າ TurboLoop smart contract ໃນ BSC.",
      hi: "कदम-दर-कदम: वॉलेट कनेक्ट करें, प्लान चुनें, और BSC पर TurboLoop स्मार्ट कॉन्ट्रैक्ट में सीधे USDT जमा करें — कोई बिचौलिया नहीं।",
      ta: "படிப்படியாக: உங்கள் wallet-ஐ இணைக்கவும், திட்டத்தை தேர்வு செய்யவும், BSC-ல் TurboLoop smart contract-ல் நேரடியாக USDT செலுத்தவும்.",
      ar: "خطوة بخطوة: اربط محفظتك، اختر خطتك، وأودع USDT مباشرةً في عقد TurboLoop الذكي على BSC — لا وسيط، لا ثقة مطلوبة.",
      zh: "逐步操作：连接钱包，选择方案，直接将USDT存入BSC上的TurboLoop智能合约——无中间商，无需信任。",
      it: "Passo dopo passo: collega il tuo wallet, scegli il piano e deposita USDT direttamente nello smart contract TurboLoop su BSC — nessun intermediario.",
      ur: "قدم بقدم: اپنا wallet جوڑیں، پلان منتخب کریں، اور BSC پر TurboLoop smart contract میں براہ راست USDT جمع کریں۔",
      fr: "Étape par étape : connectez votre portefeuille, choisissez votre plan et déposez des USDT directement dans le smart contract TurboLoop sur BSC.",
      es: "Paso a paso: conecta tu wallet, elige tu plan y deposita USDT directamente en el smart contract de TurboLoop en BSC — sin intermediarios.",
      pcm: "Step by step: connect your wallet, choose your plan, and deposit USDT directly into TurboLoop smart contract for BSC — no middleman.",
      de: "Schritt für Schritt: Wallet verbinden, Plan wählen und USDT direkt in den TurboLoop Smart Contract auf BSC einzahlen — kein Mittelsmann.",
      id: "Langkah demi langkah: hubungkan wallet, pilih paket, dan deposit USDT langsung ke smart contract TurboLoop di BSC — tanpa perantara.",
    },
    hashtags: {
      en: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      th: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      ko: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      lo: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      hi: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      ta: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      ar: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      zh: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      it: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      ur: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      fr: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      es: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      pcm: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      de: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
      id: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
    },
  },
];

export interface ReelTrack {
  id: string;
  lang: ReelLang;
  title: string;
  description: string;
  hashtags: string;
  videoUrl: string;
  thumbUrl: string;
}

const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

export const LANG_META: Record<ReelLang, { label: string; flag: string; dir: string }> = {
  en:  { label: "English",            flag: "🇬🇧", dir: "en" },
  th:  { label: "ภาษาไทย",            flag: "🇹🇭", dir: "th" },
  ko:  { label: "한국어",              flag: "🇰🇷", dir: "ko" },
  lo:  { label: "ພາສາລາວ",            flag: "🇱🇦", dir: "lo" },
  hi:  { label: "हिन्दी",             flag: "🇮🇳", dir: "hi" },
  ta:  { label: "தமிழ்",              flag: "🇮🇳", dir: "ta" },
  ar:  { label: "العربية",            flag: "🇸🇦", dir: "ar" },
  zh:  { label: "中文",               flag: "🇨🇳", dir: "zh" },
  it:  { label: "Italiano",           flag: "🇮🇹", dir: "it" },
  ur:  { label: "اردو",               flag: "🇵🇰", dir: "ur" },
  fr:  { label: "Français",           flag: "🇫🇷", dir: "fr" },
  es:  { label: "Español",            flag: "🇪🇸", dir: "es" },
  pcm: { label: "Nigerian Pidgin",    flag: "🇳🇬", dir: "pcm" },
  de:  { label: "Deutsch",            flag: "🇩🇪", dir: "de" },
  id:  { label: "Bahasa Indonesia",   flag: "🇮🇩", dir: "id" },
};

function buildLangReels(lang: ReelLang): ReelTrack[] {
  return REEL_DEFS.map(def => ({
    id: def.id,
    lang,
    title: def.titles[lang] ?? def.titles["en"] ?? "",
    description: def.descriptions[lang] ?? def.descriptions["en"] ?? "",
    hashtags: def.hashtags[lang] ?? def.hashtags["en"] ?? "",
    videoUrl: `${R2}/reels/${LANG_META[lang].dir}/${def.id}.mp4`,
    // Language-specific thumbnails: all 15 languages × 4 videos = 60 unique thumbnails
    thumbUrl: `${R2}/reel-thumbs/${lang}/${def.id}.png`,
  }));
}

export const ALL_REEL_LANGS: ReelLang[] = [
  "en", "th", "ko", "lo", "hi", "ta", "ar", "zh", "it", "ur", "fr", "es", "pcm", "de", "id"
];

/** Grouped by language so the UI can render language sub-sections or
 *  language-filter tabs without flattening. */
export const MULTI_LANG_REELS: Record<ReelLang, ReelTrack[]> = Object.fromEntries(
  ALL_REEL_LANGS.map(lang => [lang, buildLangReels(lang)])
) as Record<ReelLang, ReelTrack[]>;

export const REEL_LANGUAGES: Array<{
  code: ReelLang;
  label: string;
  flag: string;
}> = ALL_REEL_LANGS.map(code => ({
  code,
  label: LANG_META[code].label,
  flag: LANG_META[code].flag,
}));

/** Flat list of all reels in display order: EN block first, then others. */
export const ALL_REELS: ReelTrack[] = ALL_REEL_LANGS.flatMap(lang => MULTI_LANG_REELS[lang]);
