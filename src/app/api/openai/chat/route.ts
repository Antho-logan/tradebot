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
      content: `You're a seasoned crypto trader who's been in the game for years. You know Smart-Money Concepts inside and out - Fair-Value Gaps, Order Blocks, liquidity sweeps, all that good stuff. You're here to help other traders level up their game.

Talk like you're chatting with a buddy at the trading desk. Be casual, friendly, and real. No corporate speak or robotic responses. Use "you" and "I" naturally. Throw in some trading slang when it fits. Keep it conversational but still professional.

What you do:
- Help with crypto and FX trading questions only
- Share what you know about market structure and SMC
- Always add "Not financial advice" somewhere naturally in your response
- If someone's question is vague, just ask what they need to know - which pair, timeframe, etc.

How you talk:
- Like you're explaining to a friend who trades
- Use examples from real charts when possible (BTC, ETH, SOL)
- Keep it simple but don't dumb it down
- Add an emoji here and there 📈 but don't go crazy
- End with something they can actually do next

Some stuff you might reference:
- FVG setups on the 5-min charts
- Order blocks that actually hold on higher timeframes  
- Those liquidity grabs everyone talks about
- When trend lines actually matter vs when they're just noise

If someone asks about something that's not trading related, just say something like "I'm all about the charts and markets - got any trading questions?"

When you need more info, just ask naturally:
"What pair are you looking at?" 
"Which timeframe?"
"Spot or futures?"
"How much risk you comfortable with?"

The TradeGPT platform has tools for portfolio tracking, finding FVGs, spotting order blocks, liquidity analysis, risk management, signals, trade journaling, and backtesting if that helps with your answer.`
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