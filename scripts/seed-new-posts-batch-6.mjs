// Tranche 4 — batch 6 (11 of 25 packs total)
//
// PACK 11 — "DeFi in Indonesia: Bahasa-First Yield Without Binance Lock-In"
//   Second regional deep-dive after Nigeria. Indonesia is one of
//   TurboLoop's largest member bases — pairs with the upcoming
//   Indonesian Zoom Presenter hire + TG channel.

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function readingTimeMin(content) {
  const words = content.replace(/\s+/g, " ").trim().split(" ").length;
  return Math.max(1, Math.ceil(words / 230));
}

const PACKS = [
  {
    scheduledPublishAt: "2026-06-19T08:30:00Z",
    slugBase: "defi-indonesia-bahasa-first-yield",
    tags: ["global", "math", "onboarding"],
    en: {
      title:
        "DeFi in Indonesia: Bahasa-First Yield Without the Binance Lock-In",
      excerpt:
        "Indonesia has 270M Muslims, the world's largest centralised-exchange user base, and Rupiah inflation eating savings. Here's why TurboLoop's stablecoin yield model fits Indonesia better than any local alternative.",
      content: `# DeFi in Indonesia: Bahasa-First Yield Without the Binance Lock-In

Indonesia is one of the largest single-country audiences for crypto on the planet. By volume, Indonesian users on Binance, Indodax, and Tokocrypto run into the tens of millions. The country also has 270 million Muslims, a Rupiah that has lost ground against the dollar steadily for a decade, and a population whose median age (29) skews young, mobile-first, and DeFi-curious.

Despite the size, most Indonesian crypto users haven't taken the step from centralised exchange to on-chain DeFi. The friction is real — language gap, unfamiliar tooling, Sharia-compliance uncertainty, fear of "rugpulls" they've seen in past local scams. TurboLoop's structure addresses each of these directly. Here's how.

## The structural fit for Indonesia

### 1. Stablecoin yield in IDR-equivalent value

The Rupiah has lost roughly 30% of its value against the US dollar over the past decade. Indonesian bank fixed deposits pay 3-5% IDR. Inflation runs 3-4%. Real returns are near zero. For savers with a multi-year horizon, this is a structurally losing position — and one most Indonesian middle-class savers haven't found an alternative to.

TurboLoop's USDT-denominated yield is the alternative. Your principal preserves dollar purchasing power. The yield comes from real protocol activity — LP fees, swap fees, on-ramp fees — denominated in stable value. Over a 5-year horizon, this changes the trajectory of a household's net worth significantly.

### 2. Bahasa-first onboarding

The TurboLoop ecosystem includes:

- Bahasa Indonesia tutorials and presentation videos
- An Indonesian-language Zoom Presenter program (we're hiring — see /careers)
- Bahasa Indonesia translations of the blog (you're reading one)
- WhatsApp + Telegram communities in Bahasa where members answer questions in their own language

Crypto onboarding fails when the language stack is wrong. A user trying to deposit USDT for the first time, who has to read English documentation, watch English tutorials, and ask questions in English — that user drops off. Bahasa-first onboarding closes the drop-off.

### 3. Sharia-compliance walkthrough

We've covered this in depth elsewhere (see ["Is Turbo Loop Halal?"](/blog/is-turboloop-halal-sharia-compliance-walkthrough)), but the short version: TurboLoop's yield comes from profit-sharing on real economic activity (LP fees, swap fees), not from interest on debt. The contract is renounced and fully transparent — no gharar. The activity is productive, not speculative — no maysir. For most Indonesian Muslim scholars who actually look at the on-chain structure rather than the surface category, the structure passes the three classical tests.

This is the conversation that doesn't happen on Binance or Tokocrypto, because they're centralised intermediaries with conventional finance instruments baked in. TurboLoop is the only major option where the Sharia conversation can land on the merits.

### 4. No centralised exchange dependency

Indonesian users who hold their savings on Binance face a familiar set of risks: account freezes, regional restrictions, KYC re-verification, withdrawal limits, and the broader CeFi risks that crystallised when FTX collapsed in 2022. None of those apply to a non-custodial wallet position in TurboLoop. The smart contract responds to your private key, not to a Binance compliance team. If Binance bans Indonesian users tomorrow (it has happened in other jurisdictions), your TurboLoop position is unaffected.

## The on-ramp from Rupiah

For an Indonesian user moving Rupiah into TurboLoop, three paths work:

**1. Turbo Buy (in-protocol).** The built-in fiat on-ramp accepts IDR via supported processors. Funds clear directly into your wallet — no centralised exchange intermediary required.

**2. P2P on Binance / Indodax / Tokocrypto.** Buy USDT on the exchange via bank transfer, withdraw to your BSC wallet, deposit into TurboLoop. Highest liquidity, lowest spread, but you sit on a CEX briefly.

**3. Local crypto OTC desks.** Jakarta, Surabaya, and Bali all have face-to-face OTC operations for larger amounts. Best for IDR-equivalent above 100 juta rupiah.

The Turbo Buy path is simplest for first-time users. P2P is cheapest for large amounts. OTC is for high net worth.

## Off-ramp to Rupiah when you need it

Reverse the on-ramp:

- Withdraw USDT from TurboLoop to your wallet
- Sell on Binance P2P or Indodax at the prevailing market rate
- Receive IDR to your bank account

Indonesian banks generally handle P2P crypto-to-IDR transfers fine, but heavy volumes (above 50-100 juta per month through a single account) can trigger compliance reviews. The mitigation is the same as anywhere: spread across multiple banks, multiple counterparties.

## The Indonesian TurboLoop community

We've held physical meetups in Jakarta, Bali (Canggu), and Surabaya with strong attendance each. Indonesian Local Presenters earn $100/month to host weekly Bahasa Zoom sessions. There's an active Bahasa Indonesia Telegram subgroup. The Indonesian Zoom Presenter role currently has an open hiring slot on /careers — we want a local lead.

This isn't a marketing veneer. It's a real community segment of the protocol, organised by Indonesian leaders, in Bahasa, for Indonesians.

## What honest Indonesian considerations look like

Three things to think about that the marketing doesn't always highlight:

1. **Tax**: Indonesia taxes crypto at 0.1% income + 0.11% VAT per transaction (since May 2022). For most users this is small but it adds up over many compounds. Keep records.

2. **Regulator tone**: Bappebti (commodity regulator) oversees crypto. The regime has been steady-positive but evolving. Check the most recent Bappebti release before deploying significant capital.

3. **CEX-to-DeFi friction**: The hardest single step for most Indonesian users is the first off-CEX withdrawal. Once your USDT is on your own BSC wallet, the rest is straightforward — but the cognitive jump from "my money is on Binance" to "my money is on a smart contract I verified myself" takes a real mindset shift.

## The compounding case for Indonesian savers

A typical Indonesian middle-class saver with 50 juta rupiah (~$3,000 USD):

- Keeps it in IDR at 4% bank yield + 4% inflation = roughly 0% real per year. After 5 years, real purchasing power is unchanged.
- Moves to TurboLoop USDT yield (typical ~12% annualised, not guaranteed, varies by month) compounded in stable value. After 5 years, real purchasing power is roughly 1.76× — a 76% real gain.

The 1.76× isn't from beating any market. It's from refusing to lose to inflation + capturing real protocol yield in stable value.

## Key takeaways

- Indonesia has 270M Muslims, a depreciating Rupiah, and the largest CeFi user base in SE Asia — structural fit for stablecoin yield
- TurboLoop's Bahasa-first onboarding closes the language drop-off that other DeFi protocols ignore
- The Sharia-compliance walk passes the three classical tests on-chain
- No CEX dependency — withdrawals can't be frozen by Binance/Indodax compliance
- On-ramp: Turbo Buy, P2P on CEX, local OTC for large amounts
- Tax + Bappebti regulatory tone are real constraints, not deal-breakers
- 5-year compounding case: roughly 1.76× real purchasing power vs IDR breakeven

For Indonesian savers, the move from IDR/CEX-USDT to on-chain TurboLoop is the single highest-leverage financial decision available in the country today. It's the move from preserving value to growing value.`,
    },
    de: {
      title:
        "DeFi in Indonesien: Bahasa-First-Yield ohne den Binance-Lock-in",
      excerpt:
        "Indonesien hat 270M Muslime, die größte zentrale-Börsen-Nutzerbasis der Welt und Rupiah-Inflation, die Ersparnisse auffrisst. Warum TurboLoops Stablecoin-Yield-Modell besser passt als jede lokale Alternative.",
      content: `# DeFi in Indonesien: Bahasa-First-Yield ohne den Binance-Lock-in

Indonesien ist eines der größten Single-Country-Publikum für Krypto auf dem Planeten. Indonesische Nutzer auf Binance, Indodax und Tokocrypto laufen volumenmäßig in die Zehnermillionen. Das Land hat auch 270 Millionen Muslime, eine Rupiah, die seit einem Jahrzehnt stetig gegen den Dollar verloren hat, und eine Bevölkerung, deren Medianalter (29) jung, mobile-first und DeFi-neugierig ist.

Trotz der Größe haben die meisten indonesischen Krypto-Nutzer den Schritt von zentraler Börse zu On-Chain-DeFi nicht gemacht. Die Friktion ist real — Sprachlücke, ungewohnte Tools, Scharia-Konformitäts-Unsicherheit, Angst vor "Rugpulls", die sie bei vergangenen lokalen Scams gesehen haben. TurboLoops Struktur adressiert jedes davon direkt.

## Der strukturelle Fit für Indonesien

### 1. Stablecoin-Yield in IDR-äquivalentem Wert

Die Rupiah hat über das letzte Jahrzehnt rund 30 % ihres Werts gegen den US-Dollar verloren. Indonesische Bank-Festgelder zahlen 3-5 % IDR. Inflation läuft 3-4 %. Reale Renditen sind nahe null. Für Sparer mit Mehrjahres-Horizont ist das eine strukturell verlustreiche Position.

TurboLoops USDT-denominierter Yield ist die Alternative. Ihr Kapital erhält Dollar-Kaufkraft. Der Yield kommt aus echter Protokollaktivität — LP-Gebühren, Swap-Gebühren, On-Ramp-Gebühren — denominiert in stabilem Wert.

### 2. Bahasa-first-Onboarding

Das TurboLoop-Ökosystem umfasst:

- Bahasa-Indonesia-Tutorials und Präsentationsvideos
- Ein indonesisch-sprachiges Zoom-Presenter-Programm (wir stellen ein)
- Bahasa-Indonesia-Übersetzungen des Blogs
- WhatsApp- + Telegram-Communities auf Bahasa, wo Mitglieder Fragen in ihrer eigenen Sprache beantworten

Krypto-Onboarding scheitert, wenn der Sprach-Stack falsch ist. Bahasa-first-Onboarding schließt den Drop-off.

### 3. Scharia-Konformitäts-Begehung

Wir haben das anderswo abgedeckt (siehe ["Ist TurboLoop halal?"](/blog/is-turboloop-halal-sharia-compliance-walkthrough)), aber die Kurzversion: TurboLoops Yield kommt aus Gewinnbeteiligung an echter Wirtschaftsaktivität (LP-Gebühren, Swap-Gebühren), nicht aus Zinsen auf Schulden. Der Contract ist renunciert und vollständig transparent — kein Gharar. Die Aktivität ist produktiv, nicht spekulativ — kein Maysir.

### 4. Keine zentrale-Börsen-Abhängigkeit

Indonesische Nutzer, die ihre Ersparnisse auf Binance halten, stehen einer bekannten Risikoreihe gegenüber: Kontosperrungen, regionale Beschränkungen, KYC-Neuverifikation, Auszahlungslimits, und die breiteren CeFi-Risiken, die sich beim FTX-Kollaps 2022 kristallisierten.

## Der On-Ramp von Rupiah

Für einen indonesischen Nutzer, der Rupiah in TurboLoop bewegt, funktionieren drei Wege:

**1. Turbo Buy (im-Protokoll).** Der eingebaute Fiat-On-Ramp akzeptiert IDR.

**2. P2P auf Binance / Indodax / Tokocrypto.** USDT auf der Börse via Banküberweisung kaufen, zum BSC-Wallet abheben.

**3. Lokale Krypto-OTC-Desks.** Jakarta, Surabaya und Bali haben Vor-Ort-OTC-Operationen.

## Off-Ramp zu Rupiah

On-Ramp umkehren: USDT aus TurboLoop abheben, auf Binance P2P oder Indodax verkaufen, IDR auf Ihr Bankkonto erhalten.

## Die indonesische TurboLoop-Community

Wir haben physische Meetups in Jakarta, Bali (Canggu) und Surabaya abgehalten. Indonesische Local Presenters verdienen 100 $/Monat, um wöchentliche Bahasa-Zoom-Sessions zu hosten.

## Ehrliche indonesische Überlegungen

Drei Dinge:

1. **Steuer**: Indonesien besteuert Krypto bei 0,1 % Einkommen + 0,11 % MwSt. pro Transaktion (seit Mai 2022).

2. **Regulator-Ton**: Bappebti überwacht Krypto. Das Regime ist stetig-positiv, aber sich entwickelnd.

3. **CEX-zu-DeFi-Friktion**: Der schwierigste Einzelschritt ist die erste Off-CEX-Auszahlung.

## Der Compounding-Fall

Ein typischer indonesischer Mittelschicht-Sparer mit 50 juta Rupiah (~3.000 $):

- In IDR bei 4 % Bank-Yield + 4 % Inflation = ~0 % real pro Jahr. Nach 5 Jahren unveränderte Kaufkraft.
- Zu TurboLoop-USDT-Yield (typisch ~12 % annualisiert) compounded. Nach 5 Jahren ~1,76× — 76 % realer Zuwachs.

## Kernpunkte

- Indonesien hat 270M Muslime, depreziierende Rupiah und größte CeFi-Nutzerbasis in SE-Asien
- TurboLoops Bahasa-first-Onboarding schließt den Sprach-Drop-off
- Die Scharia-Konformitäts-Begehung besteht die drei klassischen Tests on-chain
- Keine CEX-Abhängigkeit
- On-Ramp: Turbo Buy, P2P, lokale OTC für große Beträge
- Steuer + Bappebti sind reale Beschränkungen, keine Deal-Breaker
- 5-Jahres-Compounding-Fall: ~1,76× reale Kaufkraft gegen IDR-Breakeven`,
    },
    hi: {
      title:
        "Indonesia में DeFi: Binance Lock-In के बिना Bahasa-First Yield",
      excerpt:
        "Indonesia में 270M मुसलमान हैं, दुनिया का सबसे बड़ा centralised-exchange user base, और Rupiah inflation savings खा रहा है। TurboLoop का stablecoin yield model क्यों किसी local alternative से बेहतर है।",
      content: `# Indonesia में DeFi: Binance Lock-In के बिना Bahasa-First Yield

Indonesia दुनिया में crypto के सबसे बड़े single-country audiences में से एक है। Binance, Indodax, और Tokocrypto पर Indonesian users volume में करोड़ों में हैं। देश में 270 million मुसलमान भी हैं, एक Rupiah जो एक दशक से dollar के विरुद्ध स्थिर रूप से गिर रही है, और एक जनसंख्या जिसकी median age (29) युवा, mobile-first, और DeFi-curious है।

आकार के बावजूद, ज़्यादातर Indonesian crypto users ने centralised exchange से on-chain DeFi का कदम नहीं उठाया। Friction real है — language gap, अपरिचित tools, Sharia-compliance uncertainty, "rugpulls" का डर।

## Indonesia के लिए structural fit

### 1. IDR-equivalent value में stablecoin yield

Rupiah ने पिछले दशक में US dollar के विरुद्ध लगभग 30% मूल्य खोया है। Indonesian bank fixed deposits IDR में 3-5% pay करते हैं। Inflation 3-4% पर है। Real returns लगभग शून्य।

TurboLoop का USDT-denominated yield alternative है।

### 2. Bahasa-first onboarding

TurboLoop ecosystem में:

- Bahasa Indonesia tutorials और presentation videos
- एक Indonesian-language Zoom Presenter program
- Blog के Bahasa Indonesia translations
- WhatsApp + Telegram communities Bahasa में

### 3. Sharia-compliance walkthrough

हमने यह कहीं और cover किया है (देखिए ["क्या Turbo Loop हलाल है?"](/blog/is-turboloop-halal-sharia-compliance-walkthrough)), पर छोटा version: TurboLoop का yield असली economic activity पर profit-sharing से आता है, debt पर interest से नहीं।

### 4. कोई centralised exchange निर्भरता नहीं

Binance पर savings रखने वाले Indonesian users एक familiar risk set face करते हैं: account freezes, regional restrictions, KYC re-verification, withdrawal limits।

## Rupiah से on-ramp

तीन paths:

**1. Turbo Buy (in-protocol).** Built-in fiat on-ramp IDR accept करता है।

**2. Binance / Indodax / Tokocrypto पर P2P.** Bank transfer से exchange पर USDT ख़रीदिए, BSC wallet पर withdraw करिए।

**3. Local crypto OTC desks.** Jakarta, Surabaya, और Bali सब बड़ी amounts के लिए face-to-face OTC operations रखते हैं।

## Rupiah को off-ramp

On-ramp को reverse करिए: TurboLoop से USDT withdraw करिए, Binance P2P या Indodax पर बेचिए, अपने bank account में IDR receive करिए।

## Indonesian TurboLoop community

हमने Jakarta, Bali (Canggu), और Surabaya में physical meetups रखे हैं। Indonesian Local Presenters weekly Bahasa Zoom sessions host करने के लिए $100/month कमाते हैं।

## ईमानदार Indonesian विचार

तीन चीज़ें:

1. **Tax**: Indonesia crypto पर हर transaction पर 0.1% income + 0.11% VAT tax करता है (May 2022 से)।

2. **Regulator tone**: Bappebti crypto की oversight करता है। Regime steady-positive है पर evolving।

3. **CEX-to-DeFi friction**: सबसे मुश्किल single step पहली off-CEX withdrawal है।

## Compounding case

50 juta rupiah (~$3,000 USD) वाला typical Indonesian middle-class saver:

- IDR में 4% bank yield + 4% inflation = प्रति वर्ष लगभग 0% real। 5 साल बाद real purchasing power unchanged।
- TurboLoop USDT yield (typical ~12% annualised) पर stable value में compounded। 5 साल बाद real purchasing power लगभग 1.76× — 76% real gain।

## मुख्य बातें

- Indonesia में 270M मुसलमान, depreciating Rupiah, और SE Asia का सबसे बड़ा CeFi user base — stablecoin yield के लिए structural fit
- TurboLoop का Bahasa-first onboarding language drop-off बंद करता है
- Sharia-compliance walk तीन classical tests on-chain pass करती है
- कोई CEX dependency नहीं
- On-ramp: Turbo Buy, P2P on CEX, बड़ी amounts के लिए local OTC
- Tax + Bappebti real constraints हैं, deal-breakers नहीं
- 5-year compounding case: ~1.76× real purchasing power vs IDR breakeven`,
    },
    id: {
      title:
        "DeFi di Indonesia: Yield Bahasa-First Tanpa Lock-In Binance",
      excerpt:
        "Indonesia punya 270 juta Muslim, basis pengguna centralised exchange terbesar di dunia, dan inflasi Rupiah yang memakan tabungan. Kenapa model yield stablecoin TurboLoop lebih cocok dari alternatif lokal mana pun.",
      content: `# DeFi di Indonesia: Yield Bahasa-First Tanpa Lock-In Binance

Indonesia adalah salah satu audiens single-country terbesar untuk crypto di planet ini. Berdasarkan volume, pengguna Indonesia di Binance, Indodax, dan Tokocrypto mencapai puluhan juta. Negara ini juga punya 270 juta Muslim, Rupiah yang sudah kehilangan posisi melawan dollar konsisten selama satu dekade, dan populasi yang usia median-nya (29) muda, mobile-first, dan penasaran-DeFi.

Meski besar, sebagian besar pengguna crypto Indonesia belum mengambil langkah dari exchange tersentralisasi ke DeFi on-chain. Friksinya nyata — gap bahasa, tooling tidak familiar, ketidakpastian kepatuhan syariah, takut "rugpull" yang sudah mereka lihat di scam lokal masa lalu. Struktur TurboLoop menangani semua ini langsung.

## Kecocokan struktural untuk Indonesia

### 1. Yield stablecoin dalam nilai setara IDR

Rupiah sudah kehilangan sekitar 30% nilainya melawan dollar AS selama dekade terakhir. Deposito tetap bank Indonesia bayar 3-5% IDR. Inflasi berjalan 3-4%. Pengembalian riil hampir nol. Untuk penabung dengan horizon multi-tahun, ini posisi yang secara struktural merugi.

Yield ber-denominasi USDT TurboLoop adalah alternatifnya. Modal kamu menjaga daya beli dollar. Yield datang dari aktivitas protocol riil — fee LP, fee swap, fee on-ramp — terdenominasi dalam nilai stabil.

### 2. Onboarding Bahasa-first

Ekosistem TurboLoop mencakup:

- Tutorial dan video presentasi Bahasa Indonesia
- Program Zoom Presenter berbahasa Indonesia (kami mempekerjakan — lihat /careers)
- Terjemahan blog Bahasa Indonesia (kamu sedang membaca satu)
- Community WhatsApp + Telegram dalam Bahasa di mana anggota menjawab pertanyaan dalam bahasa mereka sendiri

Onboarding crypto gagal saat stack bahasa salah. Pengguna yang mencoba deposit USDT pertama kali, yang harus baca dokumentasi Inggris, nonton tutorial Inggris, dan bertanya dalam bahasa Inggris — pengguna itu drop-off. Onboarding Bahasa-first menutup drop-off itu.

### 3. Walkthrough kepatuhan syariah

Kami sudah membahas ini secara mendalam di tempat lain (lihat ["Apakah Turbo Loop Halal?"](/blog/is-turboloop-halal-sharia-compliance-walkthrough)), tapi versi pendek: Yield TurboLoop datang dari bagi hasil pada aktivitas ekonomi riil (fee LP, fee swap), bukan dari bunga atas utang. Kontrak renounced dan sepenuhnya transparan — tidak ada gharar. Aktivitasnya produktif, bukan spekulatif — tidak ada maysir.

Ini percakapan yang tidak terjadi di Binance atau Tokocrypto, karena mereka perantara tersentralisasi dengan instrumen keuangan konvensional di dalamnya. TurboLoop adalah satu-satunya opsi besar di mana percakapan syariah bisa diturunkan secara substantif.

### 4. Tidak ada ketergantungan exchange tersentralisasi

Pengguna Indonesia yang memegang tabungan di Binance menghadapi rangkaian risiko familiar: pembekuan akun, pembatasan regional, verifikasi ulang KYC, batasan withdrawal, dan risiko CeFi lebih luas yang terkristalisasi saat FTX collapse di 2022. Tidak ada yang berlaku ke posisi wallet non-custodial di TurboLoop.

## On-ramp dari Rupiah

Untuk pengguna Indonesia yang memindahkan Rupiah ke TurboLoop, tiga jalur bekerja:

**1. Turbo Buy (in-protocol).** On-ramp fiat built-in menerima IDR via prosesor yang didukung. Dana langsung clear ke wallet — tidak perlu perantara exchange tersentralisasi.

**2. P2P di Binance / Indodax / Tokocrypto.** Beli USDT di exchange via transfer bank, withdraw ke wallet BSC, deposit ke TurboLoop. Likuiditas tertinggi, spread terendah, tapi kamu sebentar di CEX.

**3. Meja OTC crypto lokal.** Jakarta, Surabaya, dan Bali semua punya operasi OTC tatap muka untuk jumlah lebih besar. Terbaik untuk setara IDR di atas 100 juta rupiah.

Jalur Turbo Buy paling simpel untuk pengguna pertama kali. P2P paling murah untuk jumlah besar. OTC untuk high net worth.

## Off-ramp ke Rupiah saat kamu butuh

Balik on-ramp:

- Withdraw USDT dari TurboLoop ke wallet kamu
- Jual di Binance P2P atau Indodax pada tingkat pasar saat itu
- Terima IDR ke rekening bank kamu

Bank Indonesia umumnya menangani transfer P2P crypto-ke-IDR dengan baik, tapi volume tinggi (di atas 50-100 juta per bulan melalui satu rekening) bisa memicu review compliance. Mitigasi sama seperti di mana pun: sebar antar beberapa bank, beberapa counterparty.

## Community TurboLoop Indonesia

Kami sudah adakan meetup fisik di Jakarta, Bali (Canggu), dan Surabaya dengan kehadiran kuat masing-masing. Local Presenter Indonesia dapat $100/bulan untuk host sesi Zoom Bahasa mingguan. Ada subgrup Telegram Bahasa Indonesia aktif. Posisi Zoom Presenter Indonesia saat ini punya slot rekrutmen terbuka di /careers — kami ingin pemimpin lokal.

Ini bukan veneer marketing. Ini segmen community nyata dari protocol, diorganisasi oleh pemimpin Indonesia, dalam Bahasa, untuk orang Indonesia.

## Seperti apa pertimbangan jujur Indonesia

Tiga hal yang perlu dipikirkan:

1. **Pajak**: Indonesia memajaki crypto pada 0.1% pendapatan + 0.11% PPN per transaksi (sejak Mei 2022). Untuk sebagian besar pengguna ini kecil tapi terakumulasi seiring banyak compound.

2. **Tone regulator**: Bappebti (regulator komoditas) mengawasi crypto. Rezim sudah stabil-positif tapi berkembang.

3. **Friksi CEX-ke-DeFi**: Langkah tunggal tersulit untuk sebagian besar pengguna Indonesia adalah withdrawal off-CEX pertama. Begitu USDT kamu di wallet BSC sendiri, sisanya langsung — tapi lompatan kognitif dari "uangku di Binance" ke "uangku di smart contract yang aku verifikasi sendiri" butuh pergeseran pikiran nyata.

## Kasus compounding untuk penabung Indonesia

Penabung kelas menengah Indonesia khas dengan 50 juta rupiah (~$3,000 USD):

- Mempertahankan dalam IDR pada yield bank 4% + inflasi 4% = sekitar 0% riil per tahun. Setelah 5 tahun, daya beli riil tidak berubah.
- Pindah ke yield USDT TurboLoop (khas ~12% annualised, tidak dijamin, bervariasi per bulan) di-compound dalam nilai stabil. Setelah 5 tahun, daya beli riil sekitar 1.76× — kenaikan riil 76%.

1.76× bukan dari mengalahkan pasar mana pun. Dari menolak kalah ke inflasi + menangkap yield protocol riil dalam nilai stabil.

## Poin utama

- Indonesia punya 270 juta Muslim, Rupiah terdepresiasi, dan basis pengguna CeFi terbesar di Asia Tenggara — kecocokan struktural untuk yield stablecoin
- Onboarding Bahasa-first TurboLoop menutup drop-off bahasa yang protocol DeFi lain abaikan
- Walk kepatuhan syariah lulus tiga uji klasik secara on-chain
- Tidak ada ketergantungan CEX — withdrawal tidak bisa dibekukan oleh compliance Binance/Indodax
- On-ramp: Turbo Buy, P2P di CEX, OTC lokal untuk jumlah besar
- Pajak + tone regulasi Bappebti adalah batasan nyata, bukan deal-breaker
- Kasus compounding 5 tahun: sekitar 1.76× daya beli riil vs impas IDR

Untuk penabung Indonesia, perpindahan dari IDR/CEX-USDT ke TurboLoop on-chain adalah keputusan finansial dengan leverage tertinggi yang tersedia di negara saat ini. Ini perpindahan dari mempertahankan nilai ke menumbuhkan nilai.`,
    },
  },
];

(async () => {
  for (const pack of PACKS) {
    console.log(`\n— PACK: ${pack.slugBase}`);
    const enRt = readingTimeMin(pack.en.content);
    const [enRow] = await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, language, published,
         scheduled_publish_at, tags, reading_time_min)
      VALUES (${pack.en.title}, ${pack.slugBase}, ${pack.en.excerpt}, ${pack.en.content},
         'en', false, ${pack.scheduledPublishAt}, ${pack.tags}, ${enRt})
      ON CONFLICT (slug) DO NOTHING RETURNING id
    `;
    if (!enRow) { console.log("  · EN exists"); continue; }
    console.log(`  ✓ EN id=${enRow.id}`);
    for (const [lang, body] of [["de", pack.de], ["hi", pack.hi], ["id", pack.id]]) {
      const slug = `${pack.slugBase}-${lang}`;
      const rt = readingTimeMin(body.content);
      const [row] = await sql`
        INSERT INTO blog_posts (title, slug, excerpt, content, language, published,
           scheduled_publish_at, translation_of, tags, reading_time_min)
        VALUES (${body.title}, ${slug}, ${body.excerpt}, ${body.content},
           ${lang}, false, ${pack.scheduledPublishAt}, ${enRow.id}, ${pack.tags}, ${rt})
        ON CONFLICT (slug) DO NOTHING RETURNING id
      `;
      if (row) console.log(`  ✓ ${lang.toUpperCase()} id=${row.id}`);
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
