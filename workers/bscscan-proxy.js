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

    // Priority 1: BscScan meta description tag — most reliable, e.g.:
    // <meta name="Description" content="Token Rep: Unknown | Holders: 437 | As at ...">
    // <meta name="description" content="Token Rep: Unknown | Holders: 437 | As at ...">
    var metaMatch = html.match(/Holders:\s*([\d,]+)/i);
    if (metaMatch) {
      holders = metaMatch[1].replace(/,/g, "");
    }

    // Priority 2: JSON-LD or data attribute patterns
    if (!holders) {
      var jsonMatch = html.match(/"holdersCount"\s*:\s*"?([\d,]+)"?/i);
      if (jsonMatch) holders = jsonMatch[1].replace(/,/g, "");
    }

    // Priority 3: Inline text patterns like "437 token holders" or "437 holders"
    if (!holders) {
      var inlineMatch = html.match(/(\d[\d,]+)\s+(?:token\s+)?holders/i);
      if (inlineMatch) holders = inlineMatch[1].replace(/,/g, "");
    }

    // Priority 4: BscScan hidden input hdnTotalHolders or similar
    if (!holders) {
      var hdnMatch = html.match(/hdnTotalHolders[^>]*value="([\d,]+)"/i);
      if (hdnMatch) holders = hdnMatch[1].replace(/,/g, "");
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
