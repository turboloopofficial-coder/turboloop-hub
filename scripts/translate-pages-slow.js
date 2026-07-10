const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENAI_API_KEY;
const API_BASE = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';

const extracted = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted-strings.json'), 'utf8'));
const messagesDir = path.join(__dirname, '../next-app/messages');

const cleanStrings = {};
for (const [page, strings] of Object.entries(extracted)) {
  cleanStrings[page] = strings.filter(s => {
    if (s.includes('md:pb-') || s.includes('text-[') || s.includes('var(--')) return false;
    if (s.length < 3) return false;
    if (s.includes('accelerometer;')) return false;
    return true;
  });
}

const enJsonPath = path.join(messagesDir, 'en.json');
const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

const languages = [
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'th', name: 'Thai' },
  { code: 'ko', name: 'Korean' },
  { code: 'lo', name: 'Lao' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'it', name: 'Italian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'pcm', name: 'Nigerian Pidgin' },
  { code: 'de', name: 'German' },
  { code: 'id', name: 'Indonesian' }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function translateAll() {
  const pagesToTranslate = Object.keys(cleanStrings).filter(p => cleanStrings[p].length > 0);
  
  for (const lang of languages) {
    console.log(`Translating to ${lang.name}...`);
    const langPath = path.join(messagesDir, `${lang.code}.json`);
    let langJson = {};
    if (fs.existsSync(langPath)) {
      langJson = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    }
    
    for (const page of pagesToTranslate) {
      if (langJson[page]) continue; // Skip if already translated
      
      const stringsToTranslate = enJson[page];
      
      let success = false;
      let retries = 0;
      
      while (!success && retries < 5) {
        try {
          const response = await fetch(`${API_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              messages: [
                {
                  role: "system",
                  content: `You are a professional translator for a DeFi protocol called TurboLoop. Translate the following JSON object of UI strings from English to ${lang.name}. Keep the exact same JSON keys. Return ONLY valid JSON, no markdown formatting, no explanations.`
                },
                {
                  role: "user",
                  content: JSON.stringify(stringsToTranslate, null, 2)
                }
              ],
              temperature: 0.1
            })
          });
          
          const data = await response.json();
          
          if (data.error) {
            console.log(`  - Rate limited on ${page}, waiting 10s...`);
            await sleep(10000);
            retries++;
            continue;
          }
          
          let content = data.choices[0].message.content.trim();
          if (content.startsWith('```json')) {
            content = content.replace(/```json\n?/, '').replace(/```$/, '');
          }
          
          langJson[page] = JSON.parse(content);
          console.log(`  - Translated ${page}`);
          success = true;
          
          // Add a small delay between successful requests to avoid hitting limits
          await sleep(2000);
          
        } catch (e) {
          console.error(`  - Error on ${page}:`, e.message);
          await sleep(5000);
          retries++;
        }
      }
    }
    
    fs.writeFileSync(langPath, JSON.stringify(langJson, null, 2));
  }
  console.log('All translations complete!');
}

translateAll();
