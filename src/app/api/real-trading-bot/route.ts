import { NextRequest, NextResponse } from 'next/server';
import { realTradingBot } from '../../../../services/realTradingBot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const status = realTradingBot.getStatus();
        return NextResponse.json({
          success: true,
          data: status
        });

      case 'portfolio':
        const portfolio = realTradingBot.getPortfolio();
        return NextResponse.json({
          success: true,
          data: portfolio
        });

      case 'force-cycle':
        await realTradingBot.forceCycle();
        return NextResponse.json({
          success: true,
          message: 'Trading cycle executed'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: status, portfolio, or force-cycle'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Real trading bot API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    switch (action) {
      case 'start':
        if (config) {
          realTradingBot.updateConfig(config);
        }
        await realTradingBot.start();
        return NextResponse.json({
          success: true,
          message: 'Real trading bot started',
          data: realTradingBot.getStatus()
        });

      case 'stop':
        realTradingBot.stop();
        return NextResponse.json({
          success: true,
          message: 'Real trading bot stopped',
          data: realTradingBot.getStatus()
        });

      case 'update-config':
        if (!config) {
          return NextResponse.json({
            success: false,
            error: 'Config is required for update-config action'
          }, { status: 400 });
        }
        realTradingBot.updateConfig(config);
        return NextResponse.json({
          success: true,
          message: 'Bot configuration updated',
          data: realTradingBot.getStatus()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: start, stop, or update-config'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Real trading bot API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 