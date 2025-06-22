# Paper Trading Setup & Configuration

## Overview
The paper trading system simulates real trades using live market data from Blowfin. It's designed to test trading strategies without risking real money.

## Key Features
- **Real-time market data** from Blowfin exchange
- **Accurate P&L calculations** for both long and short positions
- **Auto-trading capabilities** with configurable parameters
- **Live price updates** every 5-10 seconds
- **$100 starting balance** for realistic small-account testing

## Recent Fixes (December 2024)

### 1. Fixed Incorrect Price Data
- **Problem**: System was showing BTC at $104,000 instead of actual ~$89,000
- **Solution**: 
  - Updated all mock/fallback prices to realistic current values
  - Changed Blowfin API from sandbox to production mode
  - Added password parameter for Blowfin authentication

### 2. Removed Fake Demo Trades
- **Problem**: Hardcoded demo trades with wrong prices
- **Solution**: Removed all fake trades - system now only shows real paper trades

### 3. Created Real-time Price Endpoint
- **New endpoint**: `/api/paper-trading/prices`
- **Features**: 
  - Fetches live prices from Blowfin
  - 10-second cache to prevent rate limiting
  - Realistic fallback prices when API is unavailable

## API Endpoints

### Execute Paper Trade
```
POST /api/paper-trading/execute
{
  "pair": "BTC/USDT",
  "mode": "manual" | "auto",
  "side": "long" | "short",
  "sizeUsd": 50
}
```

### Get Paper Trades
```
GET /api/paper-trading/trades?limit=10&status=open
```

### Get Trading Stats
```
GET /api/paper-trading/stats
```

### Test Price Feed
```
GET /api/paper-trading/test-prices
```

### Auto-Trading Control
```
POST /api/paper-trading/auto-trade
{
  "action": "start" | "stop" | "update_config" | "scan_now",
  "config": {
    "pairs": ["BTC/USDT:USDT", "ETH/USDT:USDT"],
    "maxPositions": 3,
    "riskPerTrade": 0.02,
    "minConfidence": 0.65
  }
}
```

## Environment Variables Required
```
BLOWFIN_API_KEY=your_api_key
BLOWFIN_API_SECRET=your_api_secret
BLOWFIN_PASSPHRASE=your_passphrase
```

## Testing the System

1. **Verify Price Feed**:
   ```bash
   curl http://localhost:3000/api/paper-trading/test-prices
   ```

2. **Execute a Test Trade**:
   ```bash
   curl -X POST http://localhost:3000/api/paper-trading/execute \
     -H "Content-Type: application/json" \
     -d '{"pair":"BTC/USDT","mode":"manual","side":"long","sizeUsd":50}'
   ```

3. **Check Open Positions**:
   ```bash
   curl http://localhost:3000/api/paper-trading/trades?status=open
   ```

## Troubleshooting

### Prices Still Wrong?
1. Check environment variables are set correctly
2. Verify Blowfin API credentials are valid
3. Test the price endpoint: `/api/paper-trading/test-prices`
4. Check console logs for API errors

### No Trades Showing?
1. Trades are only created when you execute them
2. Check `/api/paper-trading/trades` endpoint directly
3. Ensure database connection is working (if using Supabase)

### Auto-Trading Not Working?
1. Start auto-trading with POST to `/api/paper-trading/auto-trade`
2. Check minimum confidence setting (default 0.65)
3. Verify selected trading pairs are supported
4. Monitor logs for signal generation

## P&L Calculation Formula

For **LONG** positions:
```
P&L = (Current Price - Entry Price) × Quantity
P&L % = (P&L / Size USD) × 100
```

For **SHORT** positions:
```
P&L = (Entry Price - Current Price) × Quantity
P&L % = (P&L / Size USD) × 100
```

Where:
- Quantity = Size USD / Entry Price
- Current Price = Live price from Blowfin

## Next Steps
1. Monitor the paper trading dashboard
2. Execute some test trades
3. Let auto-trading run for a few hours
4. Analyze the results in the trade journal
5. Adjust strategy parameters based on performance 