const CONTRACT = "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3";
const BSCSCAN_URL = "https://bscscan.com/token/" + CONTRACT;

addEventListener("fetch", function(event) {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  var corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    var res = await fetch(BSCSCAN_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    var html = await res.text();

    var holders = null;
    var patterns = [
      /Holders:\s*([\d,]+)/i,
      /"holdersCount"\s*:\s*"?([\d,]+)"?/i,
      /(\d[\d,]+)\s+(?:token\s+)?holders/i,
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = html.match(patterns[i]);
      if (match) {
        holders = match[1].replace(/,/g, "");
        break;
      }
    }

    if (!holders) {
      return new Response(
        JSON.stringify({ holders: null, holdersNum: null, fresh: false, error: "parse_failed" }),
        { headers: corsHeaders }
      );
    }

    var holdersNum = parseInt(holders, 10);
    var result = {
      holders: holdersNum.toLocaleString("en-US"),
      holdersNum: holdersNum,
      fresh: true,
      fetchedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ holders: null, holdersNum: null, fresh: false, error: err.message }),
      { headers: corsHeaders }
    );
  }
}
