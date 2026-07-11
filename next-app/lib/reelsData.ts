// Multi-language "Shorts / Reels" data — 5 tutorial videos × 15 languages.
// Audio for each language is AI-dubbed (gTTS) from the English originals.
// DE and ID use the original human-recorded voiceovers.
// Lao (lo) uses English audio as Lao TTS is not widely available.
// Thumbnails: language-specific for all 15 languages × 5 videos (75 total).
// Thumbnail CDN path: reel-thumbs/{lang}/{video_id}.png

export type ReelLang =
  | "en" | "th" | "ko" | "lo" | "hi" | "ta"
  | "ar" | "zh" | "it" | "ur" | "fr" | "es"
  | "pcm" | "de" | "id" | "bn";

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
      bn: "BSC স্মার্ট কন্ট্রাক্টের মাধ্যমে উইথড্র করার পদ্ধতি",
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
      bn: "আপনার অর্থ। আপনার নিয়ন্ত্রণ। সর্বদা অন-চেইন। ওয়েবসাইট ছাড়াই BSC স্মার্ট কন্ট্রাক্টের মাধ্যমে সরাসরি TurboLoop থেকে উইথড্র করুন।",
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
      bn: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
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
      bn: "বিনিয়োগের রিটার্ন — ৩০ দিনের Loop সম্পন্ন",
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
      bn: "৩০ দিনের Loop সম্পন্ন। রিটার্ন এসে গেছে। সম্পূর্ণ বিশ্লেষণ: প্রতিদিনের রিটার্ন, কম্পাউন্ডিং কৌশল এবং পুরস্কার কিভাবে ক্লেইম করবেন।",
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
      bn: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
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
      bn: "LP Lock যাচাই — $34.7M লিকুয়িডিটি যাচাইকৃত",
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
      bn: "$34.7M লিকুয়িডিটি। ১০০% লকড। সম্পূর্ণ যাচাইকৃত। BscScan এবং PancakeSwap-এ TurboLoop-এর LP lock নিজেই যাচাই করুন।",
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
      bn: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
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
      bn: "BSC স্মার্ট কন্ট্রাক্টের মাধ্যমে ডিপোজিট করার পদ্ধতি",
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
      bn: "ধাপে ধাপে: আপনার wallet কানেক্ট করুন, প্ল্যান বেছে নিন, এবং BSC-তে TurboLoop স্মার্ট কন্ট্রাক্টে সরাসরি USDT ডিপোজিট করুন — কোনো মধ্যস্থকারী নেই।",
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
      bn: "#TurboLoop #DeFi #BSC #SmartContract #HowTo",
    },
  },
  {
    id: "v5-lp-position",
    titles: {
      en: "Check Position via V3 Position Manager",
      th: "ตรวจสอบตำแหน่งผ่าน V3 Position Manager",
      ko: "V3 포지션 매니저로 포지션 확인하기",
      lo: "ກວດສອບຕຳແໜ່ງຜ່ານ V3 Position Manager",
      hi: "V3 Position Manager से Position कैसे चेक करें",
      ta: "V3 Position Manager மூலம் Position சரிபார்க்கவும்",
      ar: "التحقق من المركز عبر مدير مراكز V3",
      zh: "通过V3仓位管理器查看仓位",
      it: "Controlla la Posizione tramite il V3 Position Manager",
      ur: "V3 Position Manager کے ذریعے پوزیشن چیک کریں",
      fr: "Vérifier sa Position via le V3 Position Manager",
      es: "Verificar Posición via el Gestor de Posiciones V3",
      pcm: "How to Check Position for V3 Position Manager",
      de: "Position über den V3 Position Manager prüfen",
      id: "Cek Posisi via V3 Position Manager",
      bn: "V3 Position Manager-এর মাধ্যমে পজিশন যাচাই করুন",
    },
    descriptions: {
      en: "See exactly where your liquidity sits. Use the PancakeSwap V3 Position Manager to verify TurboLoop's $34.7M LP position is IN RANGE and fully active.",
      th: "ดูว่าสภาพคล่องอยู่ที่ไหน ใช้ PancakeSwap V3 Position Manager ยืนยัน LP position ของ TurboLoop มูลค่า $34.7M อยู่ใน IN RANGE",
      ko: "PancakeSwap V3 Position Manager를 사용하여 TurboLoop의 $34.7M LP 포지션이 IN RANGE 상태인지 확인하세요.",
      lo: "ໃຊ້ PancakeSwap V3 Position Manager ຍືນຍັນ LP position ຂອງ TurboLoop $34.7M ຢູ່ IN RANGE.",
      hi: "PancakeSwap V3 Position Manager का उपयोग करके TurboLoop की $34.7M LP position को IN RANGE में सत्यापित करें।",
      ta: "PancakeSwap V3 Position Manager மூலம் TurboLoop-இன் $34.7M LP position IN RANGE-ல் உள்ளதை சரிபார்க்கவும்.",
      ar: "استخدم PancakeSwap V3 Position Manager للتحقق من أن مركز LP البالغ $34.7M لـ TurboLoop في النطاق.",
      zh: "使用PancakeSwap V3仓位管理器验证TurboLoop的$34.7M LP仓位处于IN RANGE状态。",
      it: "Usa il PancakeSwap V3 Position Manager per verificare che la posizione LP da $34.7M di TurboLoop sia IN RANGE.",
      ur: "PancakeSwap V3 Position Manager استعمال کریں تاکہ TurboLoop کی $34.7M LP position IN RANGE میں ہو۔",
      fr: "Utilisez le PancakeSwap V3 Position Manager pour vérifier que la position LP de $34.7M de TurboLoop est IN RANGE.",
      es: "Usa el PancakeSwap V3 Position Manager para verificar que la posición LP de $34.7M de TurboLoop está IN RANGE.",
      pcm: "Use PancakeSwap V3 Position Manager check TurboLoop $34.7M LP position dey IN RANGE.",
      de: "Verwenden Sie den PancakeSwap V3 Position Manager, um TurboLoops $34.7M LP-Position als IN RANGE zu verifizieren.",
      id: "Gunakan PancakeSwap V3 Position Manager untuk memverifikasi posisi LP $34.7M TurboLoop berada IN RANGE.",
      bn: "PancakeSwap V3 Position Manager ব্যবহার করে TurboLoop-এর $34.7M LP পজিশন IN RANGE-এ আছে কিনা যাচাই করুন।",
    },
    hashtags: {
      en: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      th: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      ko: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      lo: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      hi: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      ta: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      ar: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      zh: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      it: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      ur: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      fr: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      es: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      pcm: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      de: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      id: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
      bn: "#TurboLoop #PancakeSwap #V3 #LiquidityPool #DeFi",
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

/**
 * Exact set of dubbed reels available in R2 as of July 8 2026.
 * Any lang/slug combo NOT in this set falls back to the English original.
 * Format: "{lang}/{slug}"
 */
const DUBBED_REELS = new Set([
  "hi/001-vs-54-percent",
  "hi/3-streams-of-income",
  "hi/80-countries-cant-be-wrong",
  "hi/90-day-math",
  "hi/bank-called-miss-money",
  "hi/blockchain-never-lies",
  "hi/code-doesnt-take-holidays",
  "hi/day1-vs-day365",
  "hi/global-momentum",
  "hi/laughed-at-bitcoin-2010",
  "hi/leadership-journey",
  "hi/rug-pull-proof",
  "hi/safest-number-in-defi",
  "hi/smartest-people-are-quiet",
  "hi/turbolooptech-everything-free",
  "hi/what-50-becomes-3-years",
  "hi/wifi-makes-money-sleep",
  "ko/001-vs-54-percent",
  "ko/3-streams-of-income",
  "ko/80-countries-cant-be-wrong",
  "ko/90-day-math",
  "ko/bank-called-miss-money",
  "ko/blockchain-never-lies",
  "ko/code-doesnt-take-holidays",
  "ko/day1-vs-day365",
  "ko/global-momentum",
  "ko/laughed-at-bitcoin-2010",
  "ko/leadership-journey",
  "ko/rug-pull-proof",
  "ko/safest-number-in-defi",
  "ko/smartest-people-are-quiet",
  "ko/turbolooptech-everything-free",
  "ko/what-50-becomes-3-years",
  "ko/wifi-makes-money-sleep",
  "ta/001-vs-54-percent",
  "ta/3-streams-of-income",
  "ta/80-countries-cant-be-wrong",
  "ta/90-day-math",
  "ta/bank-called-miss-money",
  "ta/blockchain-never-lies",
  "ta/code-doesnt-take-holidays",
  "ta/day1-vs-day365",
  "ta/global-momentum",
  "ta/laughed-at-bitcoin-2010",
  "ta/leadership-journey",
  "ta/rug-pull-proof",
  "ta/safest-number-in-defi",
  "th/001-vs-54-percent",
  "th/3-streams-of-income",
  "th/80-countries-cant-be-wrong",
  "th/90-day-math",
  "th/bank-called-miss-money",
  "th/blockchain-never-lies",
  "th/code-doesnt-take-holidays",
  "th/day1-vs-day365",
  "th/global-momentum",
  "th/laughed-at-bitcoin-2010",
  "th/leadership-journey",
  "th/rug-pull-proof",
  "th/safest-number-in-defi",
  "th/smartest-people-are-quiet",
  "th/turbolooptech-everything-free",
  "th/what-50-becomes-3-years",
  "th/wifi-makes-money-sleep",
  // ── Tutorial videos (v1–v4) dubbed in all 14 non-English languages ──────
  // v1-v3: all 14 languages verified in R2 on 2026-07-09.
  // v4-deposit: 12 languages verified; de+id dubbed and uploaded 2026-07-09.
  "th/v1-withdrawal",  "th/v2-investment",  "th/v3-lp-check",  "th/v4-deposit",
  "ko/v1-withdrawal",  "ko/v2-investment",  "ko/v3-lp-check",  "ko/v4-deposit",
  "hi/v1-withdrawal",  "hi/v2-investment",  "hi/v3-lp-check",  "hi/v4-deposit",
  "lo/v1-withdrawal",  "lo/v2-investment",  "lo/v3-lp-check",  "lo/v4-deposit",
  "ta/v1-withdrawal",  "ta/v2-investment",  "ta/v3-lp-check",  "ta/v4-deposit",
  "ar/v1-withdrawal",  "ar/v2-investment",  "ar/v3-lp-check",  "ar/v4-deposit",
  "zh/v1-withdrawal",  "zh/v2-investment",  "zh/v3-lp-check",  "zh/v4-deposit",
  "it/v1-withdrawal",  "it/v2-investment",  "it/v3-lp-check",  "it/v4-deposit",
  "ur/v1-withdrawal",  "ur/v2-investment",  "ur/v3-lp-check",  "ur/v4-deposit",
  "fr/v1-withdrawal",  "fr/v2-investment",  "fr/v3-lp-check",  "fr/v4-deposit",
  "es/v1-withdrawal",  "es/v2-investment",  "es/v3-lp-check",  "es/v4-deposit",
  "pcm/v1-withdrawal", "pcm/v2-investment", "pcm/v3-lp-check", "pcm/v4-deposit",
  "de/v1-withdrawal",  "de/v2-investment",  "de/v3-lp-check",  "de/v4-deposit",
  "id/v1-withdrawal",  "id/v2-investment",  "id/v3-lp-check",  "id/v4-deposit",
  // v5-lp-position: all 14 non-English languages (old V3 Position Manager dubbed videos)
  "th/v5-lp-position",  "ko/v5-lp-position",  "lo/v5-lp-position",  "hi/v5-lp-position",
  "ta/v5-lp-position",  "ar/v5-lp-position",  "zh/v5-lp-position",  "it/v5-lp-position",
  "ur/v5-lp-position",  "fr/v5-lp-position",  "es/v5-lp-position",  "pcm/v5-lp-position",
  "de/v5-lp-position",  "id/v5-lp-position",
  // ── Bangla (bn) tutorial videos — dubbed and uploaded 2026-07-11 ──────────
  "bn/v1-withdrawal",  "bn/v2-investment",  "bn/v3-lp-check",  "bn/v4-deposit",  "bn/v5-lp-position",
]);

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
  bn:  { label: "বাংলা",               flag: "🇧🇩", dir: "bn" },
};

function buildLangReels(lang: ReelLang): ReelTrack[] {
  return REEL_DEFS.map(def => {
    // Use dubbed version if available, otherwise fall back to English original
    const hasDub = lang === "en" || DUBBED_REELS.has(`${lang}/${def.id}`);
    const videoLang = hasDub ? lang : "en";
    return {
      id: def.id,
      lang,
      title: def.titles[lang] ?? def.titles["en"] ?? "",
      description: def.descriptions[lang] ?? def.descriptions["en"] ?? "",
      hashtags: def.hashtags[lang] ?? def.hashtags["en"] ?? "",
      videoUrl: `${R2}/reels/${LANG_META[videoLang].dir}/${def.id}.mp4`,
      // Language-specific thumbnails: all 15 languages × 5 videos = 75 unique thumbnails
      thumbUrl: `${R2}/reel-thumbs/${lang}/${def.id}.png`,
    };
  });
}

export const ALL_REEL_LANGS: ReelLang[] = [
  "en", "th", "ko", "lo", "hi", "ta", "ar", "zh", "it", "ur", "fr", "es", "pcm", "de", "id", "bn"
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
