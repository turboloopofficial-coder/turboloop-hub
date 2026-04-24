require("dotenv/config");
const http = require("http");
const handlerMod = require("../api/trpc/[trpc].js");
const handler = handlerMod.default || handlerMod;
console.log("handler type:", typeof handler);

const server = http.createServer((req, res) => {
  Promise.resolve(handler(req, res)).catch((err) => {
    console.error("HANDLER ERROR:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String(err.message || err), stack: err.stack }));
  });
});

server.listen(4001, () => console.log("test server on http://localhost:4001"));
