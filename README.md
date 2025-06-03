# TradeGPT - AI-Powered Trading Platform

Advanced AI-driven tools for smart-money crypto trading. Monitor, analyze, and execute with institutional-grade precision.

## Features

- 🧠 **AI Trading Assistant** - Specialized in Smart-Money Concepts (SMC)
- 📊 **Portfolio Dashboard** - Real-time performance tracking
- 📝 **Trade Journal** - Document and analyze your trades
- 🎯 **Risk/Reward Calculator** - Professional trade setup analysis
- 📈 **Live Market Data** - Real-time cryptocurrency prices
- 🔧 **Trading Tools** - Fair Value Gaps, Order Blocks, Liquidity Analysis

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - for AI chat functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tradegpt-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI chat functionality | Optional* |

*The AI chat will work with the server-side API key. Users can optionally provide their own key via the UI.

## API Keys Setup

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env.local` file
4. Restart the development server

## Project Structure

```
tradegpt-landing/
├── src/
│   ├── app/
│   │   ├── api/openai/chat/     # OpenAI API integration
│   │   ├── components/          # React components
│   │   ├── trade-journal/       # Trade journal page
│   │   └── page.tsx            # Main landing page
├── .env.example                # Environment variables template
├── .env.local                  # Your local environment (not in git)
└── README.md                   # This file
```

## Features Overview

### AI Trading Assistant
- Specialized in Smart-Money Concepts (SMC)
- Fair-Value Gaps (FVGs), Order Blocks (OBs), Liquidity analysis
- Break-of-Structure (BOS/MSS) identification
- Risk management guidance

### Trade Journal
- Professional trade entry form
- Risk/reward calculator with real dollar amounts
- Image upload for chart screenshots
- Excel-like trade history table
- Local storage persistence

### Portfolio Dashboard
- Real-time P&L tracking
- Performance metrics
- Risk analysis tools

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: OpenAI GPT-4

## Security

- API keys are stored in environment variables
- `.env.local` is excluded from version control
- Client-side API key storage is optional
- Server-side API key fallback for seamless operation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For support or questions, please contact the development team.
