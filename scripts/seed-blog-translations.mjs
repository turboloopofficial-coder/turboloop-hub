// Seed German + Indonesian translations of the top published English
// blog posts. Idempotent: re-runs overwrite by slug (UPSERT).
//
// Translation policy:
//   - markdown structure preserved exactly (headings, lists, links, bold)
//   - technical terms (USDT, BSC, LP, PancakeSwap, APY, ROI, gas, dApp)
//     stay in English — German/Indonesian DeFi audiences read these as
//     loanwords and a literal translation would feel forced
//   - direct register, no marketing flourish — matches the source posts
//   - slug pattern: <english-slug>-<lang>  (e.g. foo-de, foo-id)
//
// Translations are inline rather than fetched from an API so the seed
// is reproducible offline.

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const SOURCE_IDS = {
  27: "why-turboloop-doesnt-have-a-token",
  26: "bsc-vs-ethereum-fees-explained",
  25: "how-compound-frequency-affects-returns",
  24: "daily-zoom-what-to-expect",
  23: "blockchain-transparency-explained",
};

// ─── GERMAN (5 posts) ────────────────────────────────────────────────────

const DE_TRANSLATIONS = [
  {
    sourceId: 27,
    title: "Warum Turbo Loop keinen eigenen Token hat (und warum das ein Feature ist)",
    excerpt:
      "Die meisten DeFi-Protokolle starten mit einem nativen Token. Turbo Loop hat sich dagegen entschieden. Hier ist, warum das Fehlen eines Tokens eine der stärksten Design-Entscheidungen ist.",
    content: `# Warum Turbo Loop keinen eigenen Token hat (und warum das ein Feature ist)

Wenn du lange genug in DeFi unterwegs bist, hast du dieses Muster schon hundertmal gesehen: Ein neues Protokoll startet, gibt einen eigenen Token aus, um Rendite zu zahlen, der Tokenpreis steigt, Farmer verkaufen ihre Belohnungen, der Tokenpreis bricht ein, die Rendite kollabiert, das Protokoll stirbt.

Turbo Loop hat keinen eigenen Token. **Mit Absicht.**

## Warum Tokens meistens eine Falle sind

Ein nativer Token löst ein attraktives kurzfristiges Problem: Wie zahlt man Rendite mit etwas anderem als echten Einnahmen? Einfach mehr vom eigenen Token prägen. Die Nutzer verdienen nominal viel. Das Team kassiert Wert ab. Alle sind glücklich — bis sie versuchen zu verkaufen.

Tokens ohne echten Nutzen jenseits von "Emissionen als Rendite" verlieren immer an Wert. Die einzige Frage ist, wie schnell.

## Die Turbo-Loop-Alternative

Rendite wird in **USDT** ausgezahlt — einem Stablecoin mit echter Kaufkraft. Die Rendite stammt aus echten Protokolleinnahmen:

- LP-Belohnungen aus dem USDT/USDC-Pool
- Turbo-Swap-Gebühren
- Turbo-Buy-Gebühren

Keine Emissionen. Keine Verwässerung. Kein Tokenpreis-Risiko.

## Was das Turbo Loop kostet

Keinen Token zu haben bedeutet:

- Kein Token-Pump, der Spekulanten anlockt.
- Keine spektakulären Listings auf Börsen.
- Kein "Wann Airdrop"-Meme-Engagement.
- Keine Team-Tokens, die im ersten Jahr 100-fach steigen.

All das ist in Ordnung. Das Ziel von Turbo Loop ist nicht, seine Gründer durch Tokenwertsteigerung reich zu machen — es geht darum, ein nachhaltiges Renditeprotokoll zu bauen, das auch in Jahr 5 noch funktioniert. Tokens arbeiten aktiv gegen dieses Ziel.

## Was die Nutzer stattdessen bekommen

- Eine Rendite, der sie vertrauen können, in stabilem Wert ausgedrückt.
- Keine Verwässerungssorgen.
- Keine Preischart-Angst.
- Ein einfaches mentales Modell: "Ich habe X USDT eingezahlt, ich verdiene Y USDT pro Tag."

Das ist unmodern in einer Token-besessenen Branche. Genau deshalb wird Turbo Loop noch laufen — und noch Rendite zahlen — wenn der nächste Token-Hype-Zyklus längst vorbei ist.`,
  },
  {
    sourceId: 26,
    title: "Warum Turbo Loop auf BSC läuft und nicht auf Ethereum",
    excerpt:
      "Günstiges Gas, schnelle Blöcke und eine relevante Nutzerbasis — hier ist, warum Binance Smart Chain das richtige Zuhause für ein Renditeprotokoll ist, das für jeden zugänglich sein soll.",
    content: `# Warum Turbo Loop auf BSC läuft und nicht auf Ethereum

Jedes DeFi-Projekt muss früh eine grundlegende Entscheidung treffen: Welche Blockchain? Für Turbo Loop fiel die Wahl auf **Binance Smart Chain** (BSC). Hier ist, warum — und was das für die Nutzer bedeutet.

## Das Gas-Problem auf Ethereum

Ethereum Mainnet ist die sicherste Smart-Contract-Chain, die es gibt. Sie ist auch die teuerste. An einem geschäftigen Tag kann eine einzige Transaktion 20–50 $ an Gas kosten. Für einen Nutzer, der 100 $ in eine Yield-Farm einzahlt, bedeutet das, dass 30 % seines Kapitals an Gas verloren gehen, bevor er auch nur einen Dollar an Rendite verdient.

Für die Zielgruppe von Turbo Loop — Community-Mitglieder in Nigeria, Indonesien, Indien, Brasilien, den Philippinen, der Türkei — ist Ethereum-Gas ein Ausschlusskriterium. Die wirtschaftlich sinnvolle Mindesteinlage auf Ethereum liegt bei etwa 1.000 $. Auf BSC sind es etwa 10 $.

## Die Kompromisse von BSC

- **Vorteile**: Gas typischerweise 0,10–0,50 $ pro Transaktion. Blockzeiten von 3 Sekunden. Breite DEX-Liquidität. Kompatibel mit allen Ethereum-Tools.
- **Nachteile**: Zentralisierter als Ethereum. Weniger Node-Betreiber. Weniger Dezentralisierungs-Theater, mehr praktische Nutzbarkeit.

Für ein Renditeprotokoll, bei dem Nutzer häufig Re-Loopen müssen und bei dem kleine Positionen zählen, überwiegen die Vorteile von BSC die Nachteile eindeutig.

## Warum Dezentralisierung nicht alles ist

Ethereum-Maximalisten argumentieren, dass jede Chain, die weniger dezentralisiert ist als Ethereum, ein Kompromiss ist. Für manche Anwendungsfälle (Wertaufbewahrung, zensurresistente Transaktionen) hält das Argument. Für ein Yield-Farming-Protokoll, bei dem die Nutzer ohnehin einem Smart Contract vertrauen, ist der marginale Unterschied in der Dezentralisierung zwischen BSC und Ethereum nicht der bindende Engpass. Die Gas-Gebühren sind es.

## Die Cross-Chain-Zukunft

Phase 8 der Turbo-Loop-Roadmap ist die Cross-Chain-Expansion. Ethereum L2s (Arbitrum, Base, Optimism) bieten Ethereum-nahe Sicherheit zu BSC-ähnlichen Kosten. Wenn Phase 8 live geht, wird Turbo Loop auf mehreren Chains verfügbar sein, und Nutzer können je nach Präferenz wählen. Aber das Kernprodukt bleibt auf BSC, weil die Nutzer dort sind.

## Für Nutzer heute

Du brauchst BNB, um Gas auf BSC zu zahlen. Winzige Beträge — 5 $ an BNB reichen für ein Jahr aktiver Nutzung locker aus. Kauf BNB über Turbo Buy (MoonPay-Integration) oder von jeder Börse, die BSC-Auszahlungen unterstützt. Danach kannst du USDT einzahlen und mit dem Verdienen beginnen.`,
  },
  {
    sourceId: 25,
    title: "Die Mathematik: Compound-Frequenz vs. Gesamtrendite",
    excerpt:
      "Tägliches Compounding vs. wöchentlich vs. monatlich — wie viel macht die Frequenz wirklich aus? Eine klare Aufschlüsselung mit den Zahlen.",
    content: `# Die Mathematik: Compound-Frequenz vs. Gesamtrendite

Eine der häufigsten Fragen neuer Turbo-Loop-Nutzer: "Wie oft sollte ich Re-Loopen?" Täglich? Wöchentlich? Monatlich? Die Antwort hängt von deinen Zielen ab — aber die Mathematik ist eindeutig, und es lohnt sich, sie zu verstehen.

## Die allgemeine Regel

Häufigeres Compounding = höhere effektive APY, bis zu einer Grenze. Der Abstand zwischen täglichem und kontinuierlichem Compounding ist klein. Der Abstand zwischen täglichem und monatlichem Compounding ist deutlich. Der Abstand zwischen monatlichem und "nie compoundieren" ist riesig.

## Ein konkretes Beispiel

Angenommen, 1 % tägliche Rendite auf 1.000 $ über 90 Tage:

- **Nie compoundieren** (reiner Zinseszins): 1.000 $ + (1 $ × 90) = **1.090 $**. Du hast 90 $ verdient.
- **Monatlich compoundieren** (alle 30 Tage): Etwa **1.334 $**. Du hast 334 $ verdient.
- **Wöchentlich compoundieren** (alle 7 Tage): Etwa **1.390 $**. Du hast 390 $ verdient.
- **Täglich compoundieren**: 1.000 $ × (1,01)^90 = **2.449 $**. Du hast 1.449 $ verdient.

Von "nie compoundieren" zu "täglich compoundieren": **16-mal mehr Einnahmen** über 90 Tage, gleiches Startkapital, gleicher Tagessatz.

## Warum der Abstand so groß ist

Die Rendite jedes Tages wird zu neuem Kapital, das die Rendite des nächsten Tages erwirtschaftet. Je länger du compoundierst, desto größer die Compound-Basis, desto schneller das Wachstum. Das ist die exponentielle Wachstumskurve, die langfristige DeFi-Renditen so dramatisch macht.

## Gas-Überlegungen

Auf BSC kosten Re-Loop-Transaktionen 0,10–0,50 $ in BNB. Für eine Position von 100 $ kann tägliches Compounding 30 $/Jahr an Gas kosten — der Break-even liegt bei dieser Größe etwa beim wöchentlichen Compounding. Für eine Position von 1.000 $ lohnt sich tägliches Compounding eindeutig. Für eine Position von 10.000 $ ist täglich oder sogar zweimal täglich optimal.

## Praktische Empfehlung

- **Position unter 500 $**: Wöchentlich Re-Loopen.
- **Position 500–5.000 $**: Täglich Re-Loopen.
- **Position über 5.000 $**: Täglich Re-Loopen, ggf. zu gasarmen Zeiten bündeln.

Die zentrale Erkenntnis: **Lass deine Rendite nicht ungenutzt liegen.** Ob du täglich oder wöchentlich compoundierst, ist weniger wichtig als ob du überhaupt compoundierst.`,
  },
  {
    sourceId: 24,
    title: "Der tägliche Zoom-Call: Was wirklich passiert und warum du dabei sein solltest",
    excerpt:
      "Jeden Tag um 17:00 UTC trifft sich die globale Turbo-Loop-Community auf Zoom. Hier ist, wie ein typischer Call aussieht und warum es die beste Education ist, die du bekommen kannst.",
    content: `# Der tägliche Zoom-Call: Was wirklich passiert und warum du dabei sein solltest

Die meisten DeFi-Communities leben in Telegram und Discord. Turbo Loop ergänzt einen dritten Kanal: einen **Live-Zoom-Call jeden einzelnen Tag um 17:00 UTC**. Keine Ausnahmen. Keine freien Tage. Einfach die Community, die zusammenkommt, Updates teilt, Fragen beantwortet und gemeinsam baut.

## Was im Call passiert

Ein typischer Call von 45–60 Minuten hat drei Teile:

**1. Updates (5–10 Min)**: Protokoll-Updates, neue Aktionen, Meilensteine, kommende Events. Kurz, dicht, aktuell.

**2. Community-Spotlight (10–15 Min)**: Jemand aus der Community — ein Country-Lead, ein Top-Referrer, ein Content-Creator — teilt, was er gerade macht, gelernte Lektionen, was funktioniert. Hier kommen die echten Strategien zum Vorschein.

**3. Fragen & Antworten (20–30 Min)**: Jeder kann alles fragen. Neue Nutzer fragen "Wie compoundiere ich?". Veteranen fragen nach neuen Features. Das Team oder ein erfahrenes Community-Mitglied beantwortet jede Frage. Keine Filterung, kein PR-Sprech.

## Warum du dabei sein solltest

**Für neue Nutzer**: Die 30 Minuten, die du auf einem täglichen Zoom verbringst, sind mehr wert als 10 Stunden Anleitungen lesen. Du bekommst aktuelle Antworten von aktuellen Nutzern, nicht aus Docs, die vor Monaten geschrieben wurden.

**Für erfahrene Nutzer**: Du bleibst vorne dran — neue Tools, neue Strategien, neue Aktionen. Du bekommst außerdem direkten Zugang zur Leadership für deine eigenen Fragen.

**Für Community-Builder**: Du wirst sichtbar. Regelmäßige Teilnehmer fallen auf. Einige der größten Country-Leads haben als Zoom-Stammgäste angefangen, die gute Fragen gestellt haben.

## Join-Details

**Zeit**: 17:00 UTC täglich (prüfe deine lokale Zeitzone).
**Sprache**: Englisch (Haupt-Call). Regionale Calls in anderen Sprachen laufen separat — frag im Telegram nach.
**Zoom-Link**: Angepinnt in der [Telegram Official Community](https://t.me/TurboLoop_Official).
**Passcode**: Immer \`541427\`.

## Ein Tipp

Auch wenn du nicht live dabei sein kannst, schalte einmal zu, um die Stimmung mitzubekommen. Die meisten Leute, die es einmal probieren, kommen wieder — die Informationsdichte ist so hoch.`,
  },
  {
    sourceId: 23,
    title: "Blockchain-Transparenz: Warum jede Transaktion öffentlich ist",
    excerpt:
      "Die Blockchain ist ein öffentliches Hauptbuch. Jede Aktion auf Turbo Loop ist für jeden überprüfbar. Hier ist, was das für Nutzer tatsächlich bedeutet.",
    content: `# Blockchain-Transparenz: Warum jede Transaktion öffentlich ist

Krypto-Neulinge erkennen oft nicht: **Jede Aktion auf einer öffentlichen Blockchain ist für alle sichtbar**, für immer. Nicht nur Kontostände — jede Transaktion, jeder Smart-Contract-Aufruf, jede Zustandsänderung, jeder Zeitstempel. Das Hauptbuch ist öffentlich. Das war schon immer so.

Für Turbo Loop ist das kein Nebenfeature. Es ist das Fundament der Glaubwürdigkeit des Protokolls.

## Was du tatsächlich sehen kannst

Geh auf [bscscan.com](https://bscscan.com) und füge eine beliebige Turbo-Loop-Adresse ein. Du siehst:

- Jede Einzahlung, von jedem Nutzer, mit dem exakten USDT-Betrag und Zeitstempel.
- Jede Auszahlung und jeden Yield-Claim.
- Jede Referral-Auszahlung.
- Den gesamten Quellcode des Vertrags.
- Welche Funktionen aufgerufen wurden, von wem, wie oft.
- Den aktuellen Total Value Locked (TVL) — nicht selbst gemeldet, tatsächlich on-chain.
- Etwaige Admin-Funktionsaufrufe (auf Turbo Loop gibt es keine — der Vertrag ist renounced).

## Warum das wichtig ist

Im traditionellen Finanzwesen vertraust du der Bilanz der Bank, weil sie einmal im Jahr von Aufsichtsbehörden geprüft wird. In DeFi *ist* die Bilanz die Blockchain selbst, und jeder kann sie in jeder Sekunde jedes Tages prüfen. Wenn Turbo Loop sagt, der LP enthält X $, kannst du das in 30 Sekunden verifizieren.

Genau das bedeutet "transparent by design" wirklich. Keine Marketingsprache — buchstäbliche, kryptografische, überprüfbare Transparenz.

## Was sich nicht verstecken lässt

Wenn ein Smart Contract versuchen würde, heimlich Mittel abzuziehen, würde die Transaktion on-chain erscheinen. Wenn das Team versuchen würde, neue Tokens zu prägen, würden es alle sehen. Wenn der LP entsperrt wäre, würde der Lock-Contract das zeigen. Es gibt keine Möglichkeit, unehrlich zu agieren, ohne eine dauerhafte On-Chain-Spur zu hinterlassen.

## Wie du das nutzt

Vertrau uns nicht. Verifiziere. Nimm jede Aussage, die wir über das Protokoll machen, und prüfe sie auf BscScan. Das ist der Unterschied zwischen Protokollen, die hoffen, dass du nicht zu genau hinsiehst, und Protokollen, die wollen, dass du es tust. Turbo Loop ist für Letzteres gebaut.`,
  },
];

// ─── INDONESIAN (3 posts — top of the list) ──────────────────────────────

const ID_TRANSLATIONS = [
  {
    sourceId: 27,
    title: "Mengapa Turbo Loop Tidak Punya Token Sendiri (Dan Mengapa Itu Justru Fitur)",
    excerpt:
      "Sebagian besar protokol DeFi diluncurkan dengan token sendiri. Turbo Loop memilih untuk tidak melakukannya. Inilah alasan mengapa ketiadaan token adalah salah satu keputusan desain terkuat.",
    content: `# Mengapa Turbo Loop Tidak Punya Token Sendiri (Dan Mengapa Itu Justru Fitur)

Kalau kamu sudah lama di DeFi, kamu sudah melihat pola ini terjadi ratusan kali: protokol baru diluncurkan, menerbitkan tokennya sendiri untuk membayar yield, harga token melonjak, farmer menjual reward, harga token jatuh, yield ambruk, protokol mati.

Turbo Loop tidak punya token sendiri. **Sengaja.**

## Mengapa token biasanya jadi jebakan

Token native menyelesaikan satu masalah jangka pendek yang menggoda: bagaimana cara membayar yield tanpa pakai pendapatan riil? Cukup cetak lebih banyak tokenmu sendiri. Pengguna terlihat menghasilkan banyak secara nominal. Tim menangkap nilai. Semua orang senang — sampai mereka mencoba menjual.

Token tanpa utilitas nyata di luar "emisi sebagai yield" selalu turun nilainya. Pertanyaannya cuma seberapa cepat.

## Alternatif Turbo Loop

Yield dibayar dalam **USDT** — stablecoin dengan daya beli nyata. Yield berasal dari pendapatan protokol yang sebenarnya:

- LP reward dari pool USDT/USDC
- Fee Turbo Swap
- Fee Turbo Buy

Tidak ada emisi. Tidak ada dilusi. Tidak ada risiko harga token.

## Apa harganya bagi Turbo Loop

Tidak punya token berarti:

- Tidak ada pump token yang menarik spekulan.
- Tidak ada listing mewah di bursa.
- Tidak ada meme "kapan airdrop".
- Tidak ada token tim yang naik 100x di tahun pertama.

Semua itu tidak masalah. Tujuan Turbo Loop bukan membuat foundernya kaya lewat apresiasi token — tapi membangun protokol yield berkelanjutan yang masih jalan di tahun ke-5. Token justru bekerja melawan tujuan itu.

## Apa yang pengguna dapatkan

- Yield yang bisa dipercaya, dalam denominasi nilai stabil.
- Tidak ada kekhawatiran dilusi.
- Tidak ada kecemasan grafik harga.
- Model mental sederhana: "Saya deposit X USDT, saya menghasilkan Y USDT per hari."

Ini tidak populer di industri yang terobsesi token. Justru karena itulah Turbo Loop akan tetap berjalan — dan tetap membayar yield — ketika siklus hype token terbaru sudah lama berlalu.`,
  },
  {
    sourceId: 26,
    title: "Mengapa Turbo Loop di BSC, Bukan di Ethereum",
    excerpt:
      "Gas murah, blok cepat, dan basis pengguna yang signifikan — inilah alasan Binance Smart Chain adalah rumah yang tepat untuk protokol yield yang bisa diakses semua orang.",
    content: `# Mengapa Turbo Loop di BSC, Bukan di Ethereum

Setiap proyek DeFi harus mengambil keputusan dasar sejak awal: blockchain mana? Untuk Turbo Loop, pilihannya adalah **Binance Smart Chain** (BSC). Inilah alasannya — dan apa artinya bagi pengguna.

## Masalah gas di Ethereum

Ethereum mainnet adalah chain smart contract paling aman yang ada. Tapi juga yang paling mahal. Di hari sibuk, satu transaksi bisa menghabiskan 20–50 $ untuk gas. Untuk pengguna yang deposit 100 $ ke yield farm, itu artinya 30 % modalnya hilang ke gas sebelum dapat satu dolar pun yield.

Untuk target pengguna Turbo Loop — anggota komunitas di Nigeria, Indonesia, India, Brasil, Filipina, Turki — gas Ethereum itu pemecah deal. Deposit minimum yang masuk akal di Ethereum sekitar 1.000 $. Di BSC, minimumnya sekitar 10 $.

## Trade-off BSC

- **Plus**: Gas biasanya 0,10–0,50 $ per transaksi. Waktu blok 3 detik. Likuiditas DEX luas. Kompatibel dengan semua tooling Ethereum.
- **Minus**: Lebih tersentralisasi dibanding Ethereum. Lebih sedikit operator node. Lebih sedikit drama desentralisasi, lebih banyak kegunaan praktis.

Untuk protokol yield di mana pengguna sering perlu Re-Loop dan posisi kecil pun penting, kelebihan BSC mengalahkan kekurangannya dengan jelas.

## Mengapa desentralisasi bukan segalanya

Maximalis Ethereum berpendapat bahwa chain mana pun yang kurang terdesentralisasi dari Ethereum adalah kompromi. Untuk beberapa use case (penyimpan nilai, transaksi tahan sensor), argumen itu valid. Untuk protokol yield farming di mana pengguna toh sudah memercayai smart contract, selisih marginal antara desentralisasi BSC dan Ethereum bukan kendala yang menentukan. Gas fee yang menentukan.

## Masa depan cross-chain

Fase 8 dari roadmap Turbo Loop adalah ekspansi cross-chain. Ethereum L2 (Arbitrum, Base, Optimism) menawarkan keamanan setara Ethereum dengan biaya mirip BSC. Saat Fase 8 rilis, Turbo Loop akan tersedia di banyak chain, dan pengguna bisa memilih sesuai preferensi. Tapi produk intinya tetap di BSC karena di sanalah penggunanya berada.

## Untuk pengguna hari ini

Kamu butuh BNB untuk bayar gas di BSC. Jumlahnya kecil — 5 $ BNB cukup untuk satu tahun penggunaan aktif. Beli BNB lewat Turbo Buy (integrasi MoonPay), atau dari bursa mana pun yang mendukung penarikan ke BSC. Setelah itu kamu siap deposit USDT dan mulai menghasilkan.`,
  },
  {
    sourceId: 25,
    title: "Matematika: Frekuensi Compound vs Total Imbal Hasil",
    excerpt:
      "Compound harian vs mingguan vs bulanan — seberapa berpengaruh frekuensi itu sebenarnya? Penjabaran yang jelas dengan angkanya.",
    content: `# Matematika: Frekuensi Compound vs Total Imbal Hasil

Salah satu pertanyaan paling sering dari pengguna baru Turbo Loop: "Seberapa sering saya harus Re-Loop?" Harian? Mingguan? Bulanan? Jawabannya bergantung pada tujuanmu — tapi matematikanya jelas, dan perlu dipahami.

## Aturan umum

Compound lebih sering = APY efektif lebih tinggi, sampai batas tertentu. Selisih antara compound harian dan kontinu kecil. Selisih antara compound harian dan bulanan signifikan. Selisih antara bulanan dan "tidak pernah compound" sangat besar.

## Contoh konkret

Asumsi yield 1 % per hari pada 1.000 $, selama 90 hari:

- **Tidak pernah compound** (bunga sederhana murni): 1.000 $ + (1 $ × 90) = **1.090 $**. Hasil 90 $.
- **Compound bulanan** (setiap 30 hari): Sekitar **1.334 $**. Hasil 334 $.
- **Compound mingguan** (setiap 7 hari): Sekitar **1.390 $**. Hasil 390 $.
- **Compound harian**: 1.000 $ × (1,01)^90 = **2.449 $**. Hasil 1.449 $.

Dari tanpa-compound ke compound-harian: **hasil 16 kali lebih besar** selama 90 hari, modal awal sama, tingkat harian sama.

## Mengapa selisihnya begitu lebar

Yield setiap hari menjadi pokok baru yang menghasilkan yield hari berikutnya. Semakin lama kamu compound, semakin besar basis compound-nya, semakin cepat pertumbuhannya. Inilah kurva pertumbuhan eksponensial yang membuat imbal hasil DeFi jangka panjang terlihat dramatis.

## Pertimbangan gas

Di BSC, transaksi Re-Loop biaya gasnya 0,10–0,50 $ dalam BNB. Untuk posisi 100 $, compound harian bisa habis 30 $/tahun untuk gas — titik impas di skala ini sekitar compound mingguan. Untuk posisi 1.000 $, compound harian jelas sepadan. Untuk posisi 10.000 $, compound harian atau bahkan dua kali sehari adalah pilihan optimal.

## Rekomendasi praktis

- **Posisi di bawah 500 $**: Re-Loop mingguan.
- **Posisi 500–5.000 $**: Re-Loop harian.
- **Posisi di atas 5.000 $**: Re-Loop harian, pertimbangkan menggabungkan transaksi di jam-jam gas sepi.

Intinya: **jangan biarkan yield-mu menganggur.** Apakah kamu compound harian atau mingguan kurang penting dibanding apakah kamu compound sama sekali.`,
  },
];

// ─── Insert / upsert ─────────────────────────────────────────────────────

async function upsert(translation, lang) {
  const sourceSlug = SOURCE_IDS[translation.sourceId];
  if (!sourceSlug) throw new Error(`Unknown sourceId ${translation.sourceId}`);
  const slug = `${sourceSlug}-${lang}`;
  // Inherit cover_image + scheduled_publish_at from the source post so
  // the translated row sorts next to the original on the index page.
  const [src] = await sql`
    SELECT cover_image, scheduled_publish_at
    FROM blog_posts
    WHERE id = ${translation.sourceId}
  `;
  const coverImage = src?.cover_image ?? null;
  const scheduledAt = src?.scheduled_publish_at ?? null;

  await sql`
    INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, published, language, scheduled_publish_at)
    VALUES (${translation.title}, ${slug}, ${translation.excerpt}, ${translation.content}, ${coverImage}, true, ${lang}, ${scheduledAt})
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      excerpt = EXCLUDED.excerpt,
      content = EXCLUDED.content,
      cover_image = EXCLUDED.cover_image,
      published = EXCLUDED.published,
      language = EXCLUDED.language,
      scheduled_publish_at = EXCLUDED.scheduled_publish_at,
      updated_at = now()
  `;
  return slug;
}

(async () => {
  console.log("Seeding German translations…");
  for (const t of DE_TRANSLATIONS) {
    const slug = await upsert(t, "de");
    console.log(`  ✓ ${slug}`);
  }
  console.log("\nSeeding Indonesian translations…");
  for (const t of ID_TRANSLATIONS) {
    const slug = await upsert(t, "id");
    console.log(`  ✓ ${slug}`);
  }
  const counts = await sql`SELECT language, COUNT(*)::int AS n FROM blog_posts GROUP BY language ORDER BY language`;
  console.log("\nFinal counts:", counts);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
