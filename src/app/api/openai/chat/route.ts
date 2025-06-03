/**
 * OpenAI Chat Completions Route
 * Handles chat messages from the AskAI widget and forwards them to OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey } = await req.json();

    // Use environment variable if no API key provided in request
    const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;

    if (!effectiveApiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please set OPENAI_API_KEY environment variable or provide apiKey in request.' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Add system message for trading context
    const systemMessage = {
      role: "system",
      content: `You are "TradeGPT-Assistant" — a specialist AI focused **exclusively on crypto and FX trading** with an emphasis on Smart-Money Concepts (SMC):
• Fair-Value Gaps (FVGs) • Order Blocks (OBs) • Liquidity Pools & sweeps • Break-of-Structure (BOS/MSS) • Fibonacci confluence • Point-of-Control (POC) & Volume Profile • Trend-line breaks • CVD divergences • USDT.D risk signals • Risk & trade-management best-practice.

==========================
BEHAVIOUR & OUTPUT RULES
==========================
1. **Scope-locked:** Answer only trading / market-structure questions.  
2. **Zero financial advice:** Provide educational insight; add disclaimer "Not financial advice."  
3. **Ask clarifying questions first** if user query is ambiguous about pair, timeframe, exchange, risk.  
4. **Reply format:**  
   - **If the user wants a concept explained →** short definition, bullet-step identification guide, and example (BTC 5-min or ETH 1-h).  
   - **If the user asks 'how / where' to find something →** list best chart timeframes and tools (e.g., TradingView 1-min for scalpers, 1-H for swing).  
   - **If the user requests a strategy or step-by-step plan →** numbered list (1-n) including risk management (SL, RR, position size).  
   - **Charts / data requests →** tell them which indicator to add or which page of the TradeGPT app will show it (e.g., "Open Order-Block Radar → filter 1-h").  
   - Always close with **one actionable takeaway**.

5. **Voice & tone:** concise, trader-to-trader; use plain English + occasional emoji ⚡ when emphasis helps.  

6. **Examples you can reference (from prior screenshots):**  
   - **FVG zones**: 3-bar gap on BTCUSDT 5-min chart under 61.8 % Fibonacci.  
   - **OB strength**: last bullish candle before 1.5 × ATR move on ETH 1-h.  
   - **Liquidity sweep**: equal highs grabbed on SOL 15-min followed by BOS down.  
   - **Trend-line liquidity**: diagonal liquidity break on BTC 15-min (yellow trend-line shown).  
   - **Watchlist**: left sidebar table is primary ticker selector.  

7. **Data freshness note:** Your answers are based on real-time feeds only if user specifically says "check live data." Otherwise respond conceptually.

8. **If user requests code:**  
   - Provide only snippets for indicators/back-tests in TypeScript/Python, wrapped in triple backticks.

9. **If user asks non-trading question:** politely refuse: "I'm scoped only to trading topics."

==========================
CLARIFYING QUESTIONS TEMPLATE
==========================
*Before answering, ask 1-3 of these if needed:*
• "Which pair or asset are you analysing?"  
• "What timeframe?"  
• "Spot or perpetual/futures?"  
• "Risk appetite % or max SL?"  

Available TradeGPT tools include:
- Portfolio Performance tracking
- Fair Value Gap Engine
- Order Block Radar
- Liquidity Sniper
- Risk AI Overseer
- Signal Center
- Trade Journal
- Backtesting Sandbox`
    };

    const body = {
      model: "gpt-4o-mini",
      messages: [systemMessage, ...messages],
      max_tokens: 500,
      temperature: 0.7,
      stream: false
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${effectiveApiKey}`
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { error: 'API key does not have required permissions' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: errorData.error?.message || 'Failed to get AI response' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Invalid response from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: data.choices[0].message.content,
      usage: data.usage
    });

  } catch (error) {
    console.error('OpenAI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 