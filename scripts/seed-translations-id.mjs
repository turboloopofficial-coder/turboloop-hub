// Seed the Indonesian (Bahasa Indonesia) backfill translations for the
// 10 foundational EN posts identified in the Phase A/B/C audit.
//
// Translation philosophy:
//   • Bahasa Indonesia body. Crypto English loanwords kept as-is — that
//     matches how Indonesian crypto Telegram & forum culture actually
//     reads (deposit, withdraw, yield, smart contract, audit, LP,
//     swap, compound, renounce). Forcing literal Indonesian on those
//     terms reads stilted to actual users.
//   • Brand names stay Latin throughout: Turbo Loop, USDT, BSC,
//     BscScan, MetaMask, Trust Wallet.
//   • Educational tone, informal-formal mix that matches Indonesian
//     financial/crypto YouTube creators (which is the audience's
//     existing reference point).
//
// Idempotent — ON CONFLICT (slug) DO NOTHING.

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const TRANSLATIONS = [
  {
    parentId: 1,
    parentSlug: "what-is-turbo-loop-complete-defi-ecosystem",
    title: "Apa Itu Turbo Loop? Ekosistem DeFi Lengkap Dijelaskan",
    excerpt:
      "Enam pilar, satu mesin yang mandiri. Inilah yang membuat Turbo Loop beda dari setiap yield protocol lain di BSC.",
    content: `Kebanyakan project DeFi cuma melakukan satu hal — sebuah swap, sebuah farm, sebuah lending market. Turbo Loop melakukan enam. Dan mereka nggak cuma duduk bersebelahan. Mereka saling memberi makan.

Itulah seluruh ide-nya: ekosistem di mana setiap bagian membuat setiap bagian lain jadi lebih kuat.

## Enam pilar

Turbo Loop menggabungkan enam primitive DeFi berbeda menjadi satu sistem self-reinforcing:

1. **Turbo Buy** — On-ramp fiat-ke-crypto. User membeli USDT langsung dengan mata uang lokal mereka, tanpa centralized exchange di tengah.
2. **Turbo Swap** — DEX built-in untuk swap token instan dengan fee rendah.
3. **Yield Farming** — Inti dari semuanya. Deposit USDT, dapat earning dari revenue protocol yang riil.
4. **Referral Network** — 20 level dalam. 51% reward kembali ke community builder.
5. **Leadership Program** — Tujuh rank, dari Builder sampai Legend. Payout bulanan untuk community organizer terbaik.
6. **Smart Contract Security** — Audited. Ownership renounced. LP locked. Bisa diverifikasi di BscScan.

> [!KEY]
> Kebanyakan yield protocol mengandalkan token emission untuk membayar user — artinya deposit baru membayar yang lama. Yield Turbo Loop datang dari aktivitas protocol yang riil: swap fee, on-ramp fee, dan LP reward. Itulah kenapa nggak collapse.

## Bagaimana semuanya terhubung

Lihat apa yang terjadi saat satu user baru deposit USDT:

- Deposit masuk ke LP pool, menghasilkan swap fee
- Referrer-nya dapat persentase (dan *referrer-nya* juga, sampai 20 level naik)
- Swap fee tadi memberi makan yield pool tempat semua orang dapat earning
- On-ramp yang bikin mereka bisa sampai ke DeFi
- Audit + renounced ownership yang bikin mereka cukup percaya untuk deposit ke contract

Setiap action memicu cascade. Itulah **Revenue Flywheel**.

## Apa yang bukan

Turbo Loop bukan:

- Token launch (nggak ada native token — by design)
- Sebuah meme play
- Protocol yang harus dipercaya operatornya (ownership sudah renounced)
- Promosi jangka pendek (contract-nya permanen dan immutable)

> [!TIP]
> Jangan percaya kata-kata kami untuk semua ini — verifikasi contract di BscScan, baca audit-nya, lihat LP lock sendiri. Justru itu intinya.

## Kenapa ini penting

DeFi punya masalah credibility. Kebanyakan project release token, hype-kan, dan collapse. Yang bertahan adalah yang dibangun di atas economic activity riil.

Turbo Loop dibangun di atas tiga revenue stream riil yang sudah ada terlepas dari token speculation: orang swap, orang on-ramp, orang menyediakan likuiditas. Yield datang dari sana — bukan dari pencetakan token.

## Poin utama

- Turbo Loop = enam DeFi primitive dalam satu ekosistem mandiri
- Yield dari aktivitas riil (swap fee + on-ramp fee + LP reward), bukan token emission
- Referral 20 level berarti pertumbuhan community langsung memperkuat yield
- Smart contract audited, renounced, dan LP-locked — siapa pun bisa verifikasi on-chain

Selamat datang di yield protocol paling transparan di BSC.`,
  },
  {
    parentId: 3,
    parentSlug: "turbo-loop-security-deep-dive",
    title: "Kenapa Turbo Loop Salah Satu Protocol DeFi Paling Aman di BSC",
    excerpt:
      "Lima pilar keamanan yang membuat Turbo Loop trustless by design — bukan dengan janji.",
    content: `Security di DeFi bukan fitur — itu fondasi. Kalau contract-nya nggak aman, hal lain nggak ada artinya.

Security model Turbo Loop dibangun di lima pilar. Setiap satunya bisa kamu verifikasi sekarang juga, tanpa tool khusus.

## Pilar 1: Audit Independen

Smart contract di-audit oleh firma security eksternal sebelum launch. Bukan self-audit. Bukan review teman-teman dari tim. Audit independen dengan public report.

> [!INFO]
> Audit nggak berarti contract bebas bug selamanya. Artinya pada saat audit, nggak ada issue kritis yang ditemukan oleh profesional yang pekerjaannya memang mencari issue. Itu standar tertinggi yang bisa dilewati smart contract sebelum launch.

## Pilar 2: Ownership Renounced

Ini bagian besarnya. Setelah deployment, tim memanggil \`renounceOwnership()\` di contract. Function itu mentransfer ownership ke zero address — \`0x0000...0000\`.

Apa artinya dalam praktek:

- Nggak ada yang bisa ubah fee
- Nggak ada yang bisa pause contract
- Nggak ada yang bisa mint token
- Nggak ada yang bisa drain dana
- Nggak ada yang bisa upgrade logic

Tim punya akses ke contract yang sama dengan user random di jalan. Nol. Nggak ada.

> Renounced ownership adalah pembeda antara "kamu harus percaya tim" dan "kamu nggak perlu percaya siapa pun."

## Pilar 3: LP 100% Locked

LP token dari liquidity pool dikirim ke contract time-lock. Mereka nggak bisa ditarik. Selamanya.

Ini menghilangkan exit scam DeFi paling umum: tim menarik likuiditas dan kabur dengan deposit semua orang. Dengan LP locked, **likuiditas-nya secara struktural permanen**.

## Pilar 4: Verified di BscScan

Source code contract di-publish dan verified di BscScan. Siapa pun bisa:

- Baca setiap baris
- Lihat setiap function
- Cek setiap state variable
- Trace setiap transaksi

> [!TIP]
> Kalau mau verifikasi salah satu sendiri, search alamat contract Turbo Loop di bscscan.com, klik tab "Contract", lalu "Read Contract" untuk lihat live state, atau "Code" untuk lihat source.

## Pilar 5: Operasi 100% On-Chain

Nggak ada komponen off-chain. Nggak ada backend yang bisa berbohong soal balance kamu. Nggak ada database private yang bisa dimodifikasi. Semua ada di blockchain — setiap deposit, setiap reward, setiap withdrawal.

Selama network BSC up, dana kamu accessible. Nggak ada website yang kalau ditutup bikin akses kamu putus. Contract-nya ADALAH protocol.

## $100K Challenge

Tim begitu yakin dengan model ini sampai mereka meletakkan **$100,000 USDT** di meja untuk siapa pun yang bisa membuktikan contract punya titik centralization — cara apa pun bagi tim untuk akses dana user tanpa renounce.

> [!KEY]
> Bug bounty terbuka untuk centralization bukan marketing. Itu tantangan permanen. Selama bounty ada dan unclaimed, itu bukti model security-nya bekerja.

## Apa yang nggak dilindungi

Jujur: security nggak infinite. Lima pilar ini melindungi dari:

- Team rug pull (mustahil)
- Perubahan fee (mustahil)
- Contract upgrade (mustahil)
- Penarikan likuiditas (mustahil)

Mereka nggak melindungi dari:

- Network BSC failure (sangat nggak mungkin, tapi teoritis)
- Wallet compromise di sisi KAMU (pakai hardware wallet)
- Phishing (selalu cek URL)
- Exploit level protocol di BNB Chain

> Security itu stack. Kami sudah handle protocol layer. Kamu handle wallet layer.

## Poin utama

- 5 pilar: Audited · Renounced · LP Locked · Verified · On-chain
- Lima-lima-nya bisa diverifikasi siapa pun dalam kurang dari 10 menit
- $100K bounty adalah test permanen dan public dari model-nya
- Nggak ada team key, nggak ada upgrade path, nggak ada backdoor off-chain
- Kamu nggak percaya Turbo Loop. Kamu verifikasi Turbo Loop.

Trustless by design — bukan dengan janji.`,
  },
  {
    parentId: 5,
    parentSlug: "turbo-loop-beginner-guide-first-24-hours",
    title: "24 Jam Pertama Kamu di Turbo Loop: Panduan Lengkap Pemula",
    excerpt:
      "Hari pertama di Turbo Loop, dipetakan jam-per-jam. Connect, deposit, compound, share — tanpa membuat kesalahan yang dibuat user baru.",
    content: `24 jam pertama kamu di Turbo Loop menetapkan pola untuk semua yang ada setelahnya. Lakukan dengan benar, dan kamu siap untuk compounding success. Lakukan dengan salah, dan kamu habiskan berminggu-minggu memperbaiki kesalahan yang sebenarnya bisa dihindari.

Inilah playbook-nya.

## Jam 1: Setup wallet

Kalau belum punya, install **MetaMask** atau **Trust Wallet**. Keduanya gratis, keduanya bekerja baik dengan BSC.

### Tambahkan network BSC
Kebanyakan wallet default ke Ethereum. Kamu butuh BSC:

- Network Name: \`BNB Smart Chain\`
- RPC URL: \`https://bsc-dataseed.binance.org/\`
- Chain ID: \`56\`
- Symbol: \`BNB\`
- Block Explorer: \`https://bscscan.com\`

> [!TIP]
> MetaMask sekarang punya tombol "Add Network" yang otomatis mengisi ini untuk chain populer. Pakai itu kalau tersedia — hemat ketikan.

## Jam 2: Ambil dana starter

Kamu butuh dua hal:

1. **Sedikit BNB** (~$5) untuk gas fee
2. **USDT di BSC** untuk deposit sebenarnya

Jalan termudah: pakai **Turbo Buy** (on-ramp fiat in-platform) untuk beli USDT langsung dengan mata uang lokal kamu. Atau transfer dari centralized exchange apa pun yang support withdrawal BSC.

> [!WARN]
> Saat transfer dari exchange, **cek network dua kali**. Mengirim USDT di Ethereum (ERC-20) ke wallet BSC artinya kehilangan dana. Selalu pilih "BEP-20" atau "BSC" sebagai network withdrawal.

## Jam 3: Buat deposit pertama

Connect wallet kamu di dApp di turboloop.io. Approve USDT untuk spending. Deposit.

Itu saja. Contract handle sisanya otomatis.

## Jam 4-12: Baca, pelajari, tanyakan

Ini block paling penting di hari pertama kamu. Jangan cuma deposit dan tunggu. Pakai waktu untuk:

- Nonton video intro di bahasa kamu
- Baca penjelasan Revenue Flywheel
- Verifikasi contract di BscScan sendiri
- Join Telegram community
- Hadir di sesi Zoom harian

> User DeFi terbaik bukan yang paling pintar — mereka yang paling sabar. Mereka belajar sebelum scaling.

## Jam 13: Ambil referral link kamu

Di dApp, copy referral link kamu. Ini URL unik kamu — setiap orang yang join melalui itu akan masuk ke referral chain kamu sampai 20 level.

Tambahkan ke:

- Bio Telegram kamu
- Pinned tweet X / Twitter
- Blog post apa pun tentang DeFi yang kamu tulis
- Mana pun yang kamu memang sering ngomongin crypto

> [!KEY]
> Referral kamu bukan gimmick — itu sumber penghasilan kedua dari protocol. Banyak top community member dapat lebih banyak dari referral network mereka dibanding dari deposit mereka sendiri. Inilah cara kerja compound community.

## Jam 14: Tetapkan cadence compounding kamu

Putuskan seberapa sering kamu akan re-loop (compound) earning kamu. Matematika-nya:

- **Daily compounding** = return maksimum, tapi gas lebih banyak
- **Weekly compounding** = keseimbangan baik untuk kebanyakan user
- **Monthly compounding** = lebih sederhana tapi return sedikit lebih rendah

> [!TIP]
> Untuk deposit di bawah ~$500, weekly compounding biasanya optimal untuk net return setelah gas. Di atas itu, daily lebih masuk akal.

## Jam 15-23: Jangan sentuh apa-apa

Serius. Tahan dorongan untuk "cek" tiap jam. Contract melakukan persis apa yang dirancangnya. Mundur. Ambil kopi. Baca buku.

## Jam 24: Review

Setelah hari pertama:

- Catat reward yang kamu dapat
- Putuskan frekuensi compounding kamu
- Set waktu recurring untuk share referral link
- Rencanakan hadir di satu Zoom minggu ini

Itulah playbook-nya.

## Kesalahan hari pertama yang umum (hindari ini)

> [!WARN]
> 1. **Network salah saat transfer** — kirim USDT di chain yang salah
> 2. **Approve infinite spend tanpa berpikir** — set limit kalau ragu
> 3. **Nggak simpan seed phrase offline** — tulis di kertas, simpan secara fisik
> 4. **Compounding terlalu agresif** — biaya gas habiskan deposit kecil
> 5. **Lewatkan Telegram community** — bantuan-nya riil, gratis, dan instan

## Poin utama

- Jam 1-3: Wallet, network BSC, USDT, deposit pertama
- Jam 4-12: Pelajari sistem, verifikasi contract, join community
- Jam 13: Ambil dan share referral link
- Jam 14+: Set cadence compounding, lalu biarkan saja
- Hindari 5 kesalahan klasik (terutama transfer network-salah)

Selamat datang di Turbo Loop. 23 jam berikutnya adalah bagian mudah.`,
  },
  {
    parentId: 7,
    parentSlug: "why-renounced-ownership-changes-everything",
    title: "Kenapa Renounced Ownership Adalah Fondasi DeFi Trustless",
    excerpt:
      "Saat ownership smart contract di-renounce, nggak ada — developer, tim, attacker pun — yang bisa ubah perilakunya. Inilah kenapa itu penting.",
    content: `# Kenapa Renounced Ownership Adalah Fondasi DeFi Trustless

Di ruang di mana rug pull dan backdoor exploit jadi headline setiap minggu, satu kata membawa bobot yang luar biasa: **renounced**. Saat ownership smart contract sudah di-renounce, artinya alamat admin khusus yang men-deploy contract sudah secara permanen di-set ke zero address — \`0x0000...0000\`. Nggak ada yang bisa panggil function admin-only. Nggak ada yang bisa upgrade contract. Nggak ada yang bisa drain LP. Bukan tim. Bukan pemerintah. Bukan hacker dengan private key tim.

Inilah fondasi yang dibangun Turbo Loop.

## Arti renouncement sebenarnya on-chain

Setiap smart contract punya function. Sebagian publik — siapa pun bisa panggil (deposit, withdraw, claim). Sebagian \`onlyOwner\` — dicadangkan untuk contract deployer. Di kebanyakan protocol tahap awal, function owner-only termasuk hal seperti \`setFee\`, \`pause\`, \`upgradeImplementation\`, \`migrateLiquidity\`, \`rescueTokens\`. Berguna untuk tim yang meng-iterate protocol muda. Berbahaya begitu ada uang riil di dalamnya.

Renouncement menghapus kemampuan ini selamanya. Contract berjalan persis seperti yang ditulis, tanpa cara untuk modifikasi.

## Cara verifikasi renouncement Turbo Loop

Kamu nggak perlu percaya kata-kata kami. Pergi ke BscScan, paste alamat contract Turbo Loop, klik "Read Contract", scroll ke \`owner()\`. Nilai yang kembali adalah \`0x0000000000000000000000000000000000000000\`. Renounced. Permanen. Bisa diverifikasi dari komputer mana pun di dunia.

## Kenapa ini penting untuk deposit kamu

Saat kamu deposit USDT ke Turbo Loop, dana kamu nggak berada di wallet yang bisa diambil seseorang dan pergi begitu saja. Mereka terkunci di smart contract audited dan renounced yang hanya merespon aturan yang ditulis saat deployment. Yield kamu accrue sesuai aturan-aturan itu. Withdrawal kamu terjadi sesuai aturan-aturan itu. Nggak ada pengecualian.

Inilah tampilan DeFi trustless yang sebenarnya.`,
  },
  {
    parentId: 8,
    parentSlug: "lp-lock-explained-why-liquidity-security-matters",
    title: "LP Lock Dijelaskan: Kenapa Locked Liquidity Nggak Bisa Dinego",
    excerpt:
      "Lock liquidity pool bukan gimmick marketing — itu pertahanan paling penting melawan rug pull. Inilah apa yang dilakukannya dan cara verifikasi LP Turbo Loop.",
    content: `# LP Lock Dijelaskan: Kenapa Locked Liquidity Nggak Bisa Dinego

Kalau kamu sudah meluangkan waktu di DeFi, kamu sudah lihat pola yang sama: sebuah protocol baru launch dengan APY gila, menarik deposit, lalu suatu hari liquidity pool kosong dan developer hilang. Itu scam paling lama di crypto. Pertahanan terhadap itu sederhana, tapi banyak diabaikan: **lock LP-nya**.

## Apa itu liquidity pool?

Di protocol DeFi berbasis AMM mana pun, liquidity pool adalah cadangan token yang menopang nilai project. User bisa withdraw, swap, dan trade hanya karena LP ada. Kalau LP di-drain, user nggak bisa exit — token mereka jadi worthless.

## Apa artinya "lock" LP?

Saat kamu lock LP, LP token (yang mewakili kepemilikan likuiditas) dikirim ke smart contract time-lock yang nggak bisa melepaskannya sampai tanggal yang sudah ditentukan di masa depan jauh. Sering kali selamanya. Developer kehilangan kemampuan untuk menarik likuiditas. User dapat kepastian.

LP Turbo Loop 100% locked. Permanen.

## Verifikasi lock

Cek contract LP di BscScan. Cek owner dari LP token. Kalau itu alamat contract time-lock, lock-nya riil. Kalau itu alamat wallet yang dikontrol tim, "lock" cuma klaim.

## Kenapa "100% locked" penting

Sebagian protocol lock 50% LP, sisakan 50% di bawah kontrol tim. Itu masih exit liquidity. Hanya lock 100% yang menghilangkan risiko rug-pull sepenuhnya. Turbo Loop memilih 100%, karena kurang dari itu tetap vulnerability.

Saat kamu evaluasi protocol DeFi mana pun, tanyakan satu pertanyaan sebelum apa pun: Apakah LP 100% locked? Kalau jawabannya bukan ya, jalan terus.`,
  },
  {
    parentId: 15,
    parentSlug: "compounding-strategy-exponential-growth",
    title: "Matematika Compounding: Kenapa Re-Loop Lebih Baik Daripada Withdraw",
    excerpt:
      "Kamu sudah dengar 'compound interest adalah keajaiban dunia kedelapan.' Di DeFi, itu bahkan lebih powerful. Inilah matematika fitur Re-Loop Turbo Loop.",
    content: `# Matematika Compounding: Kenapa Re-Loop Lebih Baik Daripada Withdraw

Einstein (konon) menyebut compound interest "keajaiban dunia kedelapan." Di keuangan tradisional, compounding terjadi lambat — sekali per kuartal, mungkin harian. Di DeFi, kamu bisa compound **setiap kali kamu claim**. Dengan fitur Re-Loop Turbo Loop, compounding cuma satu klik.

## Matematika dasar

Misalnya kamu deposit $1,000 dan dapat 1% per hari sebagai yield. Setelah 30 hari:

- **Tanpa compounding** (withdraw yield): Kamu dapat $1 × 30 = $30. Saldo: $1,030.
- **Dengan compounding harian** (Re-Loop): $1,000 × (1.01)^30 = $1,347.85. Itu $347 dalam 30 hari.

Itu perbedaan 11x dalam earning, dari modal awal yang sama, dalam waktu yang sama — hanya dengan memilih compound.

## Kenapa compounding begitu powerful

Yield setiap hari jadi modal baru yang dapat yield hari berikutnya. Modal tumbuh secara geometris, bukan aritmetis. Semakin lama kamu compound, semakin lebar gap antara compounding dan withdrawing.

## Fitur Re-Loop Turbo Loop

Dari dashboard utama, satu tombol meng-invest ulang yield akumulasi kamu kembali ke contract farming. Nggak ada withdrawal manual + re-deposit. Nggak ada workflow boros gas. Satu klik, compounded.

## Pertimbangan strategis

Kebanyakan user Turbo Loop yang serius Re-Loop harian. Sebagian Re-Loop mingguan untuk hemat gas. Beberapa withdraw untuk menutup biaya hidup sambil membiarkan base position compounding. Nggak ada satu strategi yang benar — tapi secara matematis, semakin lama kamu biarkan yield compounding, semakin besar posisi akhir kamu.

Compounding adalah pembeda antara "saya dapat sedikit dari crypto" dan "crypto mengubah lintasan finansial saya." Itu mengganjar kesabaran dan disiplin, makanya itu salah satu tool paling penting di toolkit user DeFi.`,
  },
  {
    parentId: 16,
    parentSlug: "the-100k-smart-contract-challenge",
    title: "Challenge $100K Smart Contract: Taruhan Terbuka untuk Security",
    excerpt:
      "Turbo Loop menawarkan $100,000 untuk siapa pun yang bisa menemukan vulnerability atau bukti centralization. Ini bukan cuma bounty — ini pernyataan publik soal keyakinan.",
    content: `# Challenge $100K Smart Contract: Taruhan Terbuka untuk Security

Banyak project klaim smart contract mereka aman. Turbo Loop rela bertaruh $100,000 atas itu.

**$100K Smart Contract Challenge** adalah penawaran sederhana: temukan vulnerability, temukan function tercentralisasi, temukan cara apa pun untuk drain dana atau ubah perilaku, submit bukti, dan klaim $100,000 USDT. Publik. Terbuka. Tanpa batas waktu.

## Apa yang qualified

- Vulnerability di smart contract yang sudah di-deploy yang memungkinkan dana di-drain atau di-lock.
- Bukti apa pun tentang centralization (function owner-only, admin key tersembunyi, backdoor).
- Cara untuk memanipulasi perhitungan yield, payout referral, atau progresi rank leadership.

## Cara claim

- Vulnerability harus bisa didemonstrasikan on-chain (bukan teoritis).
- Submission harus include proof of concept yang reproducible.
- Auditor pihak ketiga verifikasi klaim-nya.
- Kalau valid, $100,000 USDT dibayar ke wallet submitter.

## Kenapa ini penting

Bug bounty umum di Web2 (perusahaan bayar hacker untuk temukan bug sebelum hacker jahat). Challenge centralization publik jarang di DeFi. Kebanyakan project diam-diam menahan admin privilege dan berharap nggak ada yang notice. Turbo Loop mengundang pemeriksaan, dan mendukung undangan itu dengan reward enam digit.

## Apa yang sudah kami lihat sejauh ini

Sejak challenge diumumkan, ada nol klaim valid. Bukan karena security researcher nggak mencari — tapi karena contract sudah renounced, LP locked, dan logic yang sudah diaudit nggak punya flaw yang bisa di-exploit. Inilah hasil praktis dari membangun trustless dari hari pertama.

Challenge tetap terbuka. Selamanya. Kalau kamu security researcher, silakan coba. Kami pingin kamu coba.`,
  },
  {
    parentId: 17,
    parentSlug: "why-stablecoin-yields-matter",
    title: "Kenapa Yield Stablecoin Lebih Penting dari Sebelumnya",
    excerpt:
      "Di pasar volatil, yield di stablecoin adalah satu-satunya yield yang benar-benar berarti. Inilah kenapa model USDT-based Turbo Loop cocok untuk setiap cycle.",
    content: `# Kenapa Yield Stablecoin Lebih Penting dari Sebelumnya

Yield crypto pada aset volatil terlihat luar biasa di spreadsheet — sampai harga token turun 60%. Lalu "APY 50%" kamu yang earned di aset yang depresiasi malah membuat kamu lebih buruk dari hanya pegang stablecoin. Inilah rahasia kotor kebanyakan farming DeFi: yield-nya seringkali lebih kecil dari depresiasi aset yang menghasilkannya.

Turbo Loop melewati ini sepenuhnya dengan jadi stablecoin-based.

## Model yield USDT

Kamu deposit USDT. Kamu dapat yield denominated dalam USDT. Saat kamu withdraw, kamu dapat USDT. Pada titik mana pun, modal atau yield kamu nggak bergantung pada harga BNB, harga token native Turbo Loop, atau aset volatil lain. Yield-nya yield riil, earned dalam satuan akun yang nggak turun.

## Kenapa ini langka

Kebanyakan protocol farming bayar yield dalam token emisi mereka sendiri. Harga token itu collapse begitu farmer awal menjual reward mereka, mengencerkan yield untuk farmer berikutnya. APY numerik tetap tinggi. Yield dollar-denominated jeblok.

## Sumber yield lebih penting dari angka yield

APY 30% yang bersumber dari revenue protocol aktual (swap fee, fee protocol) lebih bernilai dari APY 300% yang bersumber dari emisi yang baru di-mint yang nggak diinginkan siapa pun. Yield Turbo Loop bersumber dari:

- LP reward dari pool USDC/USDT
- Fee Turbo Swap (0.3% per transaksi)
- Fee Turbo Buy (konversi fiat-ke-crypto)

Ketiganya denominated dalam nilai stabil, dibayar dalam nilai stabil. Yield-nya adalah yield stabil.

## Apa artinya untuk user

Di bull market, kamu tangkap upside di alokasi crypto lebih luas yang kamu sudah miliki. Di bear market, posisi Turbo Loop kamu terus menghasilkan yield dalam USDT sementara segalanya turun. Yield berbasis stablecoin secara desain nggak tergantung siklus pasar.

Inilah kenapa user yang sophisticated memperlakukan protocol yield stablecoin seperti Turbo Loop sebagai base layer portfolio crypto mereka — bagian yang menghasilkan apa pun arah pasar.`,
  },
  {
    parentId: 22,
    parentSlug: "what-to-watch-for-in-a-defi-project",
    title: "7 Pertanyaan Sebelum Deposit ke Project DeFi Apa Pun",
    excerpt:
      "Kebanyakan orang lewatkan pertanyaan ini dan kehilangan uang. Tujuh pemeriksaan yang memisahkan protocol berkelanjutan dari rug pull.",
    content: `# 7 Pertanyaan Sebelum Deposit ke Project DeFi Apa Pun

Ribuan protocol DeFi launch tiap tahun. Kebanyakan gagal. Segelintir berhasil. Pembeda antara keduanya biasanya kelihatan — kalau kamu tahu apa yang harus dilihat. Inilah tujuh pertanyaan yang dilewati setiap user DeFi serius sebelum deposit satu dolar pun.

## 1. Apakah contract di-audit?

Dan — apakah laporan audit publik? Kalau tim nggak share audit-nya, audit itu nggak ada. Baca temuan sebenarnya, bukan cuma ringkasan.

## 2. Apakah ownership di-renounce?

Cek \`owner()\` di BscScan/Etherscan. Kalau itu alamat wallet yang dikontrol tim, mereka bisa modifikasi contract. Kalau itu \`0x00...00\`, contract immutable. **Nggak ada pengecualian.**

## 3. Apakah LP locked? Berapa lama? Di mana?

"Locked" bisa berarti hal yang beda. Tanyakan: berapa banyak yang locked, berapa lama, dan di contract lock apa. Verifikasi on-chain. Lock pendek (kurang dari 1 tahun) adalah tanda bahaya.

## 4. Yield datang dari mana?

Kalau jawabannya "deposit baru" atau "emisi token", model-nya nggak berkelanjutan. Cari revenue protocol riil: swap fee, trading fee, pendapatan eksternal.

## 5. Siapa di tim?

Tim anon nggak otomatis buruk, tapi mereka menaikkan standar di hal lain (code, audit, track record). Cari sejarah tim yang bisa diverifikasi — project sebelumnya, kehadiran publik, waktu membangun.

## 6. Bagaimana community-nya?

Riil, engaged, tersebar di region? Atau penuh bot, shilly, terkonsentrasi di satu bahasa? Community sehat itu beragam dan menanyakan pertanyaan sulit. Cek Telegram di waktu acak.

## 7. Bisa kamu exit?

Sebagian protocol punya fee deposit tinggi, fee withdrawal, atau periode lockup panjang yang disamarkan sebagai "vesting." Baca contract-nya. Pastikan kamu bisa withdraw yang kamu deposit kapan kamu mau.

## Bagaimana Turbo Loop skor di tujuh ini

1. ✅ Audited. Laporan publik.
2. ✅ Ownership di-renounce.
3. ✅ LP 100% locked.
4. ✅ Yield dari LP reward, fee Turbo Swap, fee Turbo Buy — semua revenue riil.
5. ✅ Track record, sejarah tim publik.
6. ✅ Community di 6 benua, 12+ bahasa, 50+ negara.
7. ✅ Nggak ada fee withdrawal. Exit kapan saja.

Tujuh dari tujuh. Inilah seperti apa protocol DeFi yang riil.`,
  },
  {
    parentId: 30,
    parentSlug: "verifying-a-defi-contract-on-bscscan",
    title: "Cara Verifikasi Contract DeFi di BscScan (Langkah demi Langkah)",
    excerpt:
      "Setiap klaim yang dibuat Turbo Loop bisa diverifikasi di BscScan. Inilah persis cara cek setiap satunya — kurang dari 5 menit.",
    content: `# Cara Verifikasi Contract DeFi di BscScan (Langkah demi Langkah)

Cara terbaik untuk memisahkan protocol DeFi yang bisa dipercaya dari yang sketchy adalah dengan baca blockchain sendiri. BscScan membuat ini mudah — bahkan untuk user non-teknis. Inilah panduan langkah-demi-langkah cara verifikasi klaim Turbo Loop (atau protocol apa pun) satu per satu.

## Langkah 1: Temukan alamat contract

Setiap protocol mempublikasikan alamat contract-nya. Alamat Turbo Loop ada di app, di docs, di pesan Telegram yang di-pin. Copy.

## Langkah 2: Buka BscScan

Buka bscscan.com. Paste alamat contract di search bar. Tekan enter.

## Langkah 3: Verifikasi source code terlihat

Di halaman contract, klik tab **Contract**. Kalau code-nya verified, kamu akan lihat source code Solidity langsung di halaman. Kalau kamu lihat "Contract Source Code Not Verified," itu red flag — tim menyembunyikan sesuatu. Code Turbo Loop sepenuhnya terlihat.

## Langkah 4: Cek ownership

Klik subtab **Read Contract**. Scroll ke \`owner()\`. Klik itu. Nilai yang kembali harus \`0x0000000000000000000000000000000000000000\` — zero address. Kalau alamat lain, contract punya owner yang bisa modifikasi. Turbo Loop return \`0x00...00\`.

## Langkah 5: Cek LP lock

Ini butuh alamat LP token (terpisah dari contract utama). Biasanya tercantum di docs. Paste ke BscScan. Cari holders list. Persentase besar (idealnya 100%) harus di-hold oleh contract time-lock yang dikenal (bukan wallet tim). Klik contract lock dan verifikasi waktu unlock — harus jauh di masa depan atau \`uint256.max\`.

## Langkah 6: Cek aktivitas terbaru

Di halaman contract utama, tab Transactions menampilkan setiap interaksi. Protocol sehat punya aktivitas user yang berkelanjutan dan riil. Riwayat transaksi kosong atau didominasi bot itu mencurigakan.

## Langkah 7: Cek total value locked

Panggil function \`totalDeposits\` atau \`totalValueLocked\` contract di Read Contract. Konversi dari wei ke human-readable (bagi 10^18). Bandingkan dengan TVL yang project klaim di website-nya. Harus match.

## Lakukan ini sebelum setiap deposit

5 menit aja. Itu menyelamatkan kamu dari 100% cara DeFi bisa salah. Inilah arti "trustless" dalam praktik — bukan percaya, tapi verifikasi.`,
  },
];

function readingTimeMin(content) {
  const words = content.replace(/\s+/g, " ").trim().split(" ").length;
  return Math.max(1, Math.ceil(words / 230));
}

(async () => {
  console.log(`Seeding ${TRANSLATIONS.length} Indonesian backfill translations…\n`);
  let inserted = 0;
  let skipped = 0;
  for (const t of TRANSLATIONS) {
    const slug = `${t.parentSlug}-id`;
    const rt = readingTimeMin(t.content);
    const result = await sql`
      INSERT INTO blog_posts
        (title, slug, excerpt, content, language, published,
         translation_of, reading_time_min)
      VALUES
        (${t.title}, ${slug}, ${t.excerpt}, ${t.content}, 'id', true,
         ${t.parentId}, ${rt})
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug
    `;
    if (result.length > 0) {
      console.log(`  ✓ inserted ${slug} (id=${result[0].id}, ${rt} min read)`);
      inserted++;
    } else {
      console.log(`  · ${slug} already exists — preserved`);
      skipped++;
    }
  }
  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);

  const linked = await sql`
    SELECT COUNT(*)::int AS n
    FROM blog_posts
    WHERE language = 'id' AND translation_of IS NOT NULL
  `;
  console.log(`Total ID translations now linked to parent: ${linked[0].n}`);
})().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
