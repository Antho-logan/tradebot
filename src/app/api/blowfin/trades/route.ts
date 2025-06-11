import { NextResponse } from "next/server";
import ccxt from "ccxt";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const symbol = searchParams.get("symbol") || undefined;

    const apiKey = process.env.BLOWFIN_API_KEY;
    const secret = process.env.BLOWFIN_API_SECRET;
    const passphrase = process.env.BLOWFIN_PASSPHRASE;

    if (!apiKey || !secret || !passphrase) {
      return NextResponse.json(
        { error: "Blowfin API credentials not configured" },
        { status: 400 }
      );
    }

    // Initialize Blowfin exchange
    const exchange = new ccxt.blofin({
      apiKey,
      secret,
      password: passphrase, // BloFin requires passphrase as 'password'
      sandbox: false,
      enableRateLimit: true,
    });

    // Fetch recent trades
    const trades = await exchange.fetchMyTrades(symbol, undefined, limit);

    // Process trades for dashboard display
    const processedTrades = trades.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      amount: trade.amount,
      price: trade.price,
      cost: trade.cost,
      fee: trade.fee?.cost || 0,
      feeCurrency: trade.fee?.currency || 'USDT',
      timestamp: trade.timestamp,
      datetime: trade.datetime,
      pnl: trade.info?.pnl || 0, // If available from exchange
    }));

    // Calculate summary statistics
    const totalVolume = processedTrades.reduce((sum, trade) => sum + trade.cost, 0);
    const totalFees = processedTrades.reduce((sum, trade) => sum + trade.fee, 0);
    const totalPnL = processedTrades.reduce((sum, trade) => sum + trade.pnl, 0);

    return NextResponse.json({
      success: true,
      data: {
        trades: processedTrades,
        summary: {
          totalTrades: processedTrades.length,
          totalVolume,
          totalFees,
          totalPnL,
        }
      },
      source: "live"
    });

  } catch (error: any) {
    console.error("Blowfin trades API error:", error.message);
    
    // Return mock trade data as fallback
    const mockTrades = [
      {
        id: "1",
        symbol: "BTC/USDT:USDT",
        side: "buy",
        amount: 0.1,
        price: 95000,
        cost: 9500,
        fee: 9.5,
        feeCurrency: "USDT",
        timestamp: Date.now() - 3600000,
        datetime: new Date(Date.now() - 3600000).toISOString(),
        pnl: 125.50,
      },
      {
        id: "2",
        symbol: "ETH/USDT:USDT",
        side: "sell",
        amount: 2.5,
        price: 3200,
        cost: 8000,
        fee: 8.0,
        feeCurrency: "USDT",
        timestamp: Date.now() - 7200000,
        datetime: new Date(Date.now() - 7200000).toISOString(),
        pnl: -45.20,
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        trades: mockTrades,
        summary: {
          totalTrades: mockTrades.length,
          totalVolume: 17500,
          totalFees: 17.5,
          totalPnL: 80.30,
        }
      },
      source: "mock",
      error: error.message
    });
  }
} 