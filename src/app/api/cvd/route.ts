import { NextResponse } from "next/server";

const API = "https://api.coinalyze.net/v1/buy-sell-history";

// Cache for stable CVD data - prevents random regeneration
const cvdCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generate realistic CVD data based on market patterns
 * This creates stable, deterministic data that doesn't change randomly
 */
function generateRealisticCVD(symbol: string, exchange: string, interval: string, points: number) {
  const cacheKey = `${symbol}-${exchange}-${interval}-${points}`;
  const cached = cvdCache.get(cacheKey);
  
  // Return cached data if still valid (prevents random regeneration)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Create deterministic seed based on symbol/exchange for consistency
  const seed = symbol.charCodeAt(0) + exchange.charCodeAt(0);
  let random = seed;
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };

  const now = Date.now();
  const intervalMs = getIntervalMs(interval);
  const cvdData = [];
  
  // Start with a realistic base CVD value
  let cumulativeCVD = 0;
  
  // Generate realistic market patterns
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - (i * intervalMs);
    
    // Create realistic volume patterns (higher during market hours, trends, etc.)
    const hourOfDay = new Date(timestamp).getUTCHours();
    const isMarketHours = hourOfDay >= 8 && hourOfDay <= 20; // Peak trading hours
    
    // Base volume with market hour multiplier
    const baseVolume = isMarketHours ? 2000 : 800;
    const volumeVariation = 0.3; // 30% variation
    
    // Generate buy/sell volumes with realistic patterns
    const totalVolume = baseVolume * (1 + (seededRandom() - 0.5) * volumeVariation);
    
    // Create trending behavior (not random walk)
    const trendFactor = Math.sin((i / points) * Math.PI * 2) * 0.1; // Gentle trend
    const buyRatio = 0.5 + trendFactor + (seededRandom() - 0.5) * 0.1; // 40-60% range
    
    const buyVolume = totalVolume * Math.max(0.3, Math.min(0.7, buyRatio));
    const sellVolume = totalVolume - buyVolume;
    
    // Calculate net flow and add to cumulative CVD
    const netFlow = buyVolume - sellVolume;
    cumulativeCVD += netFlow;
    
    cvdData.push({
      t: timestamp,
      cvd: Math.round(cumulativeCVD),
      buyVol: Math.round(buyVolume),
      sellVol: Math.round(sellVolume)
    });
  }

  // Cache the generated data
  cvdCache.set(cacheKey, { data: cvdData, timestamp: now });
  
  return cvdData;
}

function getIntervalMs(interval: string): number {
  switch (interval) {
    case "1min": return 60 * 1000;
    case "5min": return 5 * 60 * 1000;
    case "15min": return 15 * 60 * 1000;
    case "1h": return 60 * 60 * 1000;
    case "4h": return 4 * 60 * 60 * 1000;
    default: return 5 * 60 * 1000;
  }
}

/**
 * Returns CVD for specified symbol/exchange/interval.
 * Query string: ?symbol=BTCUSDT&exchange=binance&interval=5min&points=12
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") ?? "BTCUSDT";
  const exchange = searchParams.get("exchange") ?? "binance";
  const interval = searchParams.get("interval") ?? "5min";
  const points = Number(searchParams.get("points") ?? 12);

  const key = process.env.COINALYZE_API_KEY;
  
  // Try real API first if we have a valid key
  if (key && key !== "your_coinalyze_key_here" && key !== "demo_mode") {
    const url = `${API}?symbols=${symbol}.${exchange}&interval=${interval}&limit=${points}&api_key=${key}`;

    try {
      const r = await fetch(url);
      if (r.ok) {
        const data = (await r.json())[0]?.history ?? [];

        if (data.length > 0) {
          // Convert real API data to CVD array
          let running = 0;
          const cvd = data.map((d: any) => {
            running += d.buy_vol - d.sell_vol;
            return { t: d.t * 1000, cvd: running };
          });

          const current = cvd.at(-1)?.cvd ?? 0;
          const peak = Math.max(...cvd.map((p: any) => p.cvd));
          const low = Math.min(...cvd.map((p: any) => p.cvd));
          const buyRatio = data.reduce((a: number, d: any) => a + d.buy_vol, 0) /
                          data.reduce((a: number, d: any) => a + d.total_vol, 0);

          return NextResponse.json({
            ok: true,
            cvd,
            metrics: { current, peak, low, buyRatio },
            source: "live"
          });
        }
      }
    } catch (err: any) {
      console.error("CVD API error:", err.message);
    }
  }

  // Use realistic mock data (stable, not random)
  console.log("CVD: Using realistic mock data");
  const cvdData = generateRealisticCVD(symbol, exchange, interval, points);
  
  const current = cvdData[cvdData.length - 1]?.cvd ?? 0;
  const peak = Math.max(...cvdData.map(d => d.cvd));
  const low = Math.min(...cvdData.map(d => d.cvd));
  
  // Calculate realistic buy ratio from the generated data
  const totalBuyVol = cvdData.reduce((sum, d) => sum + (d.buyVol || 0), 0);
  const totalSellVol = cvdData.reduce((sum, d) => sum + (d.sellVol || 0), 0);
  const buyRatio = totalBuyVol / (totalBuyVol + totalSellVol);

  return NextResponse.json({
    ok: true,
    cvd: cvdData.map(d => ({ t: d.t, cvd: d.cvd })), // Clean output
    metrics: { current, peak, low, buyRatio },
    source: "mock"
  });
} 