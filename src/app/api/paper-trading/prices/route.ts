import { NextRequest, NextResponse } from 'next/server';
import ccxt from 'ccxt';

// Cache for price data
let priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_DURATION = 10 * 1000; // 10 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pair = searchParams.get('pair') || 'BTC/USDT';

    // Check cache first
    const cached = priceCache[pair];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: {
          pair,
          price: cached.price,
          timestamp: cached.timestamp,
          source: 'cache'
        }
      });
    }

    // Fetch fresh price from Blowfin
    const exchange = new ccxt.blofin({
      apiKey: process.env.BLOWFIN_API_KEY,
      secret: process.env.BLOWFIN_API_SECRET,
      password: process.env.BLOWFIN_PASSPHRASE,
      sandbox: false, // Use production for real prices
      enableRateLimit: true,
    });

    try {
      const ticker = await exchange.fetchTicker(pair);
      const price = ticker.last || ticker.close;

      // Update cache
      priceCache[pair] = {
        price,
        timestamp: Date.now()
      };

      return NextResponse.json({
        success: true,
        data: {
          pair,
          price,
          bid: ticker.bid,
          ask: ticker.ask,
          volume: ticker.baseVolume,
          change24h: ticker.percentage,
          timestamp: Date.now(),
          source: 'live'
        }
      });
    } catch (exchangeError) {
      console.error('Exchange error:', exchangeError);
      
      // Fallback prices based on current market
      const fallbackPrices: Record<string, number> = {
        'BTC/USDT': 89000,
        'ETH/USDT': 3150,
        'SOL/USDT': 185,
        'BTC/USDT:USDT': 89000,
        'ETH/USDT:USDT': 3150,
        'SOL/USDT:USDT': 185,
      };

      const fallbackPrice = fallbackPrices[pair] || 100;

      return NextResponse.json({
        success: true,
        data: {
          pair,
          price: fallbackPrice,
          timestamp: Date.now(),
          source: 'fallback',
          note: 'Using realistic fallback price due to API error'
        }
      });
    }

  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch price',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 