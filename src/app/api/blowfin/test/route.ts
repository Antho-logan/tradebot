import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Debug: Show all environment variables that start with BLOWFIN
    const envVars = Object.keys(process.env)
      .filter(key => key.startsWith('BLOWFIN') || key.startsWith('NODE'))
      .reduce((obj, key) => {
        obj[key] = process.env[key] ? `${process.env[key].substring(0, 8)}...` : 'undefined';
        return obj;
      }, {} as Record<string, string>);

    // Test with environment variables
    const apiKey = process.env.BLOWFIN_API_KEY;
    const apiSecret = process.env.BLOWFIN_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        ok: false,
        error: "Blowfin API credentials not found in environment variables",
        debug: {
          availableEnvVars: envVars,
          processEnvKeys: Object.keys(process.env).length,
          nodeEnv: process.env.NODE_ENV,
        },
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Return success with masked keys for security
    return NextResponse.json({
      ok: true,
      message: "Blowfin API credentials loaded successfully",
      apiKey: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      apiSecret: `${apiSecret.substring(0, 8)}...${apiSecret.substring(apiSecret.length - 4)}`,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, apiSecret } = body;
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        ok: false,
        error: "API key and secret are required",
      }, { status: 400 });
    }

    // Initialize Blowfin exchange with provided credentials
    const exchange = new ccxt.blofin({
      apiKey: apiKey,
      secret: apiSecret,
      sandbox: true, // Always use sandbox for testing user-provided keys
      enableRateLimit: true,
    });

    // Test the connection
    const balance = await exchange.fetchBalance();
    
    return NextResponse.json({
      ok: true,
      message: "Blowfin API credentials are valid",
      data: {
        exchange: "Blowfin",
        sandbox: true,
        currencies: Object.keys(balance.total || {}),
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error: any) {
    console.error("Blowfin API credential test error:", error);
    
    return NextResponse.json({
      ok: false,
      error: error.message || "Invalid API credentials",
    }, { status: 400 });
  }
} 