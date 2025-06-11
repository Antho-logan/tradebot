import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Import ccxt dynamically to avoid environment variable issues during build
    const ccxt = await import('ccxt');
    
    // Create a public instance (no API keys needed for public endpoints)
    const blowfin = new (ccxt as any).blofin({
      enableRateLimit: true,
      sandbox: process.env.NODE_ENV === 'development',
    });

    // Try to fetch server time or status (public endpoint)
    let res;
    try {
      // Try fetchStatus first if available
      if (typeof blowfin.fetchStatus === 'function') {
        res = await blowfin.fetchStatus();
      } else {
        // Fallback to fetchTime or fetchTicker for a public endpoint
        if (typeof blowfin.fetchTime === 'function') {
          res = await blowfin.fetchTime();
        } else {
          // Last resort: fetch a ticker for BTC/USDT (public data)
          res = await blowfin.fetchTicker('BTC/USDT');
          res = { timestamp: res.timestamp, symbol: res.symbol }; // Only return basic info
        }
      }
    } catch (methodError: any) {
      // If specific methods fail, try a basic ticker request
      const ticker = await blowfin.fetchTicker('BTC/USDT');
      res = { 
        timestamp: ticker.timestamp, 
        symbol: ticker.symbol,
        status: 'ok',
        message: 'Exchange is reachable via ticker endpoint'
      };
    }

    return NextResponse.json({ 
      ok: true, 
      res,
      timestamp: new Date().toISOString(),
      exchange: 'blofin'
    }, { status: 200 });

  } catch (err: any) {
    console.error("Blowfin ping failed:", err.message);
    return NextResponse.json({ 
      ok: false, 
      error: err.message,
      timestamp: new Date().toISOString(),
      exchange: 'blofin'
    }, { status: 400 });
  }
} 