const fs = require('fs');
const path = require('path');

const pages = [
  'social-wall', 'ecosystem', 'community', 'films', 'security', 
  'roadmap', 'library', 'events', 'careers', 'promotions', 
  'reels', 'learn', 'vs', 'creatives', 'blog'
];

const appDir = path.join(__dirname, '../next-app/app');
const messagesDir = path.join(__dirname, '../next-app/messages');

// We will just read the files and use regex to find text nodes and string literals
// This is a rough extraction, we'll refine it manually
const result = {};

pages.forEach(page => {
  const filePath = path.join(appDir, page, 'page.tsx');
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find JSX text nodes: >Text<
  const jsxTextRegex = />([^<\{\}]+)</g;
  let match;
  const strings = new Set();
  
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 2 && /[a-zA-Z]/.test(text)) {
      strings.add(text);
    }
  }
  
  // Find string literals in props: prop="Text"
  const propRegex = /[a-zA-Z]+="([^"]+)"/g;
  while ((match = propRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 2 && /[a-zA-Z]/.test(text) && text.includes(' ')) {
      strings.add(text);
    }
  }
  
  if (strings.size > 0) {
    result[page] = Array.from(strings);
  }
});

fs.writeFileSync(path.join(__dirname, 'extracted-strings.json'), JSON.stringify(result, null, 2));
console.log('Extracted strings to scripts/extracted-strings.json');
