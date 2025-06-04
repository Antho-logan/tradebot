/**
 * OpenAI API Key Test Route
 * Tests if the provided OpenAI API key is valid by making a simple chat completion request
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json(
        { ok: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!key.startsWith('sk-')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid API key format' },
        { status: 400 }
      );
    }

    // Test the API key with a minimal request
    const body = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 5,
      temperature: 0
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ 
        ok: true, 
        message: 'API key is valid',
        model: data.model 
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific OpenAI error types
      if (response.status === 401) {
        return NextResponse.json(
          { ok: false, error: 'Invalid API key' },
          { status: 400 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { ok: false, error: 'Rate limit exceeded' },
          { status: 400 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { ok: false, error: 'API key does not have required permissions' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { ok: false, error: errorData.error?.message || 'API key test failed' },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('OpenAI API test error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 