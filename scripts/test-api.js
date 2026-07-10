const API_KEY = process.env.OPENAI_API_KEY;
const API_BASE = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';

async function test() {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      messages: [{ role: "user", content: "Hello" }]
    })
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
