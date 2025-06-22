import { NextRequest, NextResponse } from 'next/server';
import ccxt from 'ccxt';

export async function GET(request: NextRequest) {
  try {
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BTC/USDT:USDT', 'ETH/USDT:USDT'];
    const results: any[] = [];

    // Try to get real prices from Blowfin
    try {
      const exchange = new ccxt.blofin({
        apiKey: process.env.BLOWFIN_API_KEY,
        secret: process.env.BLOWFIN_API_SECRET,
        password: process.env.BLOWFIN_PASSPHRASE,
        sandbox: false, // Use production for real prices
        enableRateLimit: true,
      });

      // Load markets first
      await exchange.loadMarkets();

      for (const pair of pairs) {
        try {
          const ticker = await exchange.fetchTicker(pair);
          results.push({
            pair,
            price: ticker.last || ticker.close,
            bid: ticker.bid,
            ask: ticker.ask,
            volume: ticker.baseVolume,
            change24h: ticker.percentage,
            timestamp: new Date(ticker.timestamp).toISOString(),
            source: 'blowfin_live'
          });
        } catch (pairError) {
          console.error(`Error fetching ${pair}:`, pairError);
          results.push({
            pair,
            error: pairError.message,
            source: 'error'
          });
        }
      }
    } catch (exchangeError) {
      console.error('Exchange error:', exchangeError);
      
      // Add fallback prices
      results.push(
        { pair: 'BTC/USDT', price: 89000, source: 'fallback', note: 'Exchange error - using realistic fallback' },
        { pair: 'ETH/USDT', price: 3150, source: 'fallback', note: 'Exchange error - using realistic fallback' },
        { pair: 'SOL/USDT', price: 185, source: 'fallback', note: 'Exchange error - using realistic fallback' }
      );
    }

    // Also test the market prices endpoint
    const marketPricesResponse = await fetch(`${request.nextUrl.origin}/api/market/prices`);
    const marketPrices = await marketPricesResponse.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        directBlowfinPrices: results,
        marketPricesEndpoint: marketPrices,
        environment: {
          hasApiKey: !!process.env.BLOWFIN_API_KEY,
          hasSecret: !!process.env.BLOWFIN_API_SECRET,
          hasPassphrase: !!process.env.BLOWFIN_PASSPHRASE,
        }
      }
    });

  } catch (error) {
    console.error('Test prices error:', error);
    return NextResponse.json({
      error: 'Failed to test prices',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 