import { NextRequest, NextResponse } from 'next/server';
import { tradingBot } from '../../../../services/botRunner';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const status = tradingBot.getStatus();
        return NextResponse.json({
          success: true,
          data: status
        });

      case 'demo-trade':
        await tradingBot.createDemoTrade();
        return NextResponse.json({
          success: true,
          message: 'Demo trade created successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: status, demo-trade'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Bot API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    switch (action) {
      case 'start':
        if (config) {
          tradingBot.updateConfig(config);
        }
        tradingBot.start();
        return NextResponse.json({
          success: true,
          message: 'Bot started successfully'
        });

      case 'stop':
        tradingBot.stop();
        return NextResponse.json({
          success: true,
          message: 'Bot stopped successfully'
        });

      case 'update-config':
        if (!config) {
          return NextResponse.json({
            success: false,
            error: 'Config is required for update-config action'
          }, { status: 400 });
        }
        tradingBot.updateConfig(config);
        return NextResponse.json({
          success: true,
          message: 'Bot configuration updated successfully'
        });

      case 'create-demo-trades':
        const count = body.count || 1;
        for (let i = 0; i < count; i++) {
          await tradingBot.createDemoTrade();
          // Small delay between trades
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return NextResponse.json({
          success: true,
          message: `${count} demo trades created successfully`
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: start, stop, update-config, create-demo-trades'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Bot API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 