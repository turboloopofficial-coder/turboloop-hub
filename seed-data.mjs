import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log('Seeding database...');

  // 1. Admin credentials
  const hash = await bcrypt.hash('Truboloop@hub123456', 12);
  await db.execute(sql`INSERT INTO admin_credentials (email, passwordHash) VALUES (${`devdady@proton.me`}, ${hash}) ON DUPLICATE KEY UPDATE passwordHash = ${hash}`);
  console.log('✓ Admin created');

  // 2. Country Leaderboard
  const leaderboard = [
    [1, 'Germany', 'DE', 'Strongest European Community', 100],
    [2, 'Nigeria', 'NG', 'Fastest Growing in Africa', 85],
    [3, 'Indonesia', 'ID', 'Leading Southeast Asia', 72],
    [4, 'India', 'IN', 'Rapidly Expanding', 65],
    [5, 'Turkey', 'TR', 'Emerging Market Leader', 50],
    [6, 'Brazil', 'BR', 'Latin America Pioneer', 40],
  ];
  for (const [rank, country, code, desc, score] of leaderboard) {
    await db.execute(sql`INSERT INTO country_leaderboard (\`rank\`, country, countryCode, description, score) VALUES (${rank}, ${country}, ${code}, ${desc}, ${score}) ON DUPLICATE KEY UPDATE country=${country}, countryCode=${code}, description=${desc}, score=${score}`);
  }
  console.log('✓ Leaderboard seeded');

  // 3. Videos - Project Presentation
  const presentations = [
    ['Project Presentation — English', 'https://youtu.be/OUSlEo9KepY', 'English', '🇬🇧'],
    ['Project Presentation — Hindi', 'https://youtu.be/a9nEwn3PlA8', 'Hindi', '🇮🇳'],
    ['Project Presentation — French', 'https://youtu.be/I-9GLDxdS_0', 'French', '🇫🇷'],
    ['Project Presentation — Spanish', 'https://youtu.be/4SQhDoRWXx4', 'Spanish', '🇪🇸'],
    ['Project Presentation — Vietnamese', 'https://youtu.be/kLYuXl1aLxI', 'Vietnamese', '🇻🇳'],
    ['Project Presentation — Indonesian', 'https://youtu.be/h4lgM3-RYjc', 'Indonesian', '🇮🇩'],
    ['Project Presentation — Italian', 'https://youtu.be/ySRo8KKDwFY', 'Italian', '🇮🇹'],
    ['Project Presentation — Russian', 'https://youtu.be/FuyW6EKQ_t8', 'Russian', '🇷🇺'],
    ['Project Presentation — Japanese', 'https://youtu.be/ul7Ju-LGQ7s', 'Japanese', '🇯🇵'],
    ['Project Presentation — German', 'https://youtu.be/QJiVeYPsDPo', 'German', '🇩🇪'],
  ];
  for (let i = 0; i < presentations.length; i++) {
    const [title, url, lang, flag] = presentations[i];
    await db.execute(sql`INSERT INTO videos (title, youtubeUrl, category, language, languageFlag, sortOrder, published) VALUES (${title}, ${url}, 'presentation', ${lang}, ${flag}, ${i + 1}, true)`);
  }
  console.log('✓ Presentation videos seeded');

  // 4. Videos - How to Join
  const howToJoin = [
    ['How to Join — English', 'https://youtu.be/nAvqu0tYioU', 'English', '🇬🇧'],
    ['How to Join — Hindi', 'https://youtu.be/l4ZWbcCFBZ4', 'Hindi', '🇮🇳'],
    ['How to Join — French', 'https://youtu.be/ACoSnn9DwlQ', 'French', '🇫🇷'],
    ['How to Join — Indonesian', 'https://youtu.be/UauR7azLAAo', 'Indonesian', '🇮🇩'],
    ['How to Join — Japanese', 'https://youtu.be/tcdNIKvXHm8', 'Japanese', '🇯🇵'],
    ['How to Join — German', 'https://youtu.be/oo17mFM1T1c', 'German', '🇩🇪'],
    ['How to Join — Italian', 'https://youtu.be/6Xjsjx_m9Os', 'Italian', '🇮🇹'],
    ['How to Join — Spanish', 'https://youtu.be/kLXE-Q0Fqlo', 'Spanish', '🇪🇸'],
    ['How to Join — Arabic', 'https://youtu.be/0lI7y-hs9fE', 'Arabic', '🇸🇦'],
    ['How to Join — Chinese', 'https://youtu.be/9wpqlHrrFew', 'Chinese', '🇨🇳'],
  ];
  for (let i = 0; i < howToJoin.length; i++) {
    const [title, url, lang, flag] = howToJoin[i];
    await db.execute(sql`INSERT INTO videos (title, youtubeUrl, category, language, languageFlag, sortOrder, published) VALUES (${title}, ${url}, 'how-to-join', ${lang}, ${flag}, ${i + 1}, true)`);
  }
  console.log('✓ How to Join videos seeded');

  // 5. Videos - Withdraw/Compound/Refer
  const withdraw = [
    ['Withdraw, Compound & Refer — English', 'https://youtu.be/sZ-10B7yhSQ', 'English', '🇬🇧'],
    ['Withdraw, Compound & Refer — Hindi', 'https://youtu.be/Zi3_BYidWP0', 'Hindi', '🇮🇳'],
    ['Withdraw, Compound & Refer — French', 'https://youtu.be/0-kOIgZfjd8', 'French', '🇫🇷'],
    ['Withdraw, Compound & Refer — Spanish', 'https://youtu.be/X6u7gbMEP14', 'Spanish', '🇪🇸'],
    ['Withdraw, Compound & Refer — Indonesian', 'https://youtu.be/MNbqWkaO_L8', 'Indonesian', '🇮🇩'],
    ['Withdraw, Compound & Refer — Italian', 'https://youtu.be/cYyOMykNHnA', 'Italian', '🇮🇹'],
    ['Withdraw, Compound & Refer — Japanese', 'https://youtu.be/f9w1sKZy2eY', 'Japanese', '🇯🇵'],
    ['Withdraw, Compound & Refer — Malay', 'https://youtu.be/W7_mX4Xxnig', 'Malay', '🇲🇾'],
  ];
  for (let i = 0; i < withdraw.length; i++) {
    const [title, url, lang, flag] = withdraw[i];
    await db.execute(sql`INSERT INTO videos (title, youtubeUrl, category, language, languageFlag, sortOrder, published) VALUES (${title}, ${url}, 'withdraw-compound', ${lang}, ${flag}, ${i + 1}, true)`);
  }
  console.log('✓ Withdraw/Compound videos seeded');

  // 6. Events - Daily Zoom
  await db.execute(sql`INSERT INTO events (title, description, dateTime, timezone, frequency, meetingLink, passcode, language, status, published) VALUES (${'Global English Zoom — Daily Community Call'}, ${'Join our daily community call to learn about Turbo Loop, ask questions, and connect with the global community.'}, ${'5:00 PM'}, ${'UTC'}, ${'Every Day'}, ${'https://us06web.zoom.us/j/8347511148?pwd=g6wTqhrngaUDNbMasv9LE8iJQOSJua.1'}, ${'541427'}, ${'English'}, ${'recurring'}, ${true})`);
  console.log('✓ Events seeded');

  // 7. Roadmap Phases
  const roadmap = [
    [1, 'Smart Contract Development', 'completed', 'Core protocol built and deployed on BSC'],
    [2, 'Security Audits', 'completed', 'Independent audits completed, ownership renounced'],
    [3, 'Turbo Swap Launch', 'completed', 'Decentralized exchange with 0.3% fee live'],
    [4, 'Turbo Buy Integration', 'completed', 'Fiat-to-crypto gateway via MoonPay'],
    [5, 'Community Building', 'completed', 'Global community established across 6+ countries'],
    [6, 'Public Launch', 'current', 'Open access, promotional programs, global expansion'],
    [7, 'Mobile App', 'upcoming', 'Native mobile experience for iOS and Android'],
    [8, 'Cross-Chain Expansion', 'upcoming', 'Multi-chain support beyond BSC'],
    [9, 'DAO Governance', 'upcoming', 'Community-driven governance and voting'],
  ];
  for (const [phase, title, status, desc] of roadmap) {
    await db.execute(sql`INSERT INTO roadmap_phases (phase, title, status, description) VALUES (${phase}, ${title}, ${status}, ${desc})`);
  }
  console.log('✓ Roadmap seeded');

  // 8. Promotions
  const promos = [
    ['smart-contract-challenge', '$100K Smart Contract Challenge', 'Find a Bug, Win Big', "Turbo Loop is so confident in its code that it offers $100,000 to anyone who can find a vulnerability. This isn't just a bounty — it's a statement of absolute trust in the protocol's security.", 1],
    ['content-creator-star', 'Content Creator Star', 'Get Paid for Views', 'Create content about Turbo Loop and earn based on your reach. Tier system: 10K views = $50, 50K views = $200, 100K views = $500, 500K+ views = $2,000.', 2],
    ['zoom-presenter', 'Local Zoom Presenter', '$100/Month for Community Leaders', 'Host weekly Zoom sessions in your local language and earn $100/month. Build your community, grow the ecosystem, and get rewarded for leadership.', 3],
    ['onboarding-bonus', 'Onboarding Bonus', 'Limited Time — 2 Months', 'New participants who deposit and refer others can earn bonus rewards. Deposit $100+ and refer 3 active users to qualify. Time-limited promotional program.', 4],
  ];
  for (const [slug, title, subtitle, desc, order] of promos) {
    await db.execute(sql`INSERT INTO promotions (slug, title, subtitle, description, active, sortOrder) VALUES (${slug}, ${title}, ${subtitle}, ${desc}, ${true}, ${order})`);
  }
  console.log('✓ Promotions seeded');

  console.log('\n✅ All data seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
