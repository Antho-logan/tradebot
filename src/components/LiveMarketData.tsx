"use client";
import useSWR from "swr";

type Price = { symbol: string; price: number; changePct: number };

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const text = await response.text();
  if (!text || text.trim() === '') {
    throw new Error('Empty response from server');
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON:', text);
    throw new Error('Invalid JSON response from server');
  }
};

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function LiveMarketData() {
  const { data, error } = useSWR<{ ok: boolean; data: Price[] }>(
    "/api/market/prices",
    fetcher,
    { 
      refreshInterval: 5000, // Reduced to 5-second polling to be less aggressive
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      onError: (err) => {
        console.error("Market data fetch error:", err);
      }
    }
  );

  if (error) {
    console.error("SWR error:", error);
    return (
      <section className="w-full py-8 bg-neutral-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <p className="text-red-400">Unable to load market data</p>
            <p className="text-neutral-500 text-sm mt-2">Please check your connection</p>
          </div>
        </div>
      </section>
    );
  }
  
  if (!data) {
    return (
      <section className="w-full py-8 bg-neutral-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <p className="text-neutral-400">Loading market data…</p>
          </div>
        </div>
      </section>
    );
  }

  // Ensure we have valid data
  if (!data.ok || !data.data || !Array.isArray(data.data)) {
    return (
      <section className="w-full py-8 bg-neutral-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <p className="text-yellow-400">Market data temporarily unavailable</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-8 bg-neutral-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Live Market Data</h2>
          <p className="text-neutral-400">Real-time cryptocurrency prices</p>
        </div>
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 p-6 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {data.data.map((p, index) => (
              <div
                key={p.symbol}
                className={cn(
                  "rounded-xl p-4 hover:bg-neutral-700/50 transition-all duration-300 cursor-pointer group",
                  p.changePct >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {p.symbol}
                  </span>
                  {p.changePct >= 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4 text-emerald-400">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-down w-4 h-4 text-red-400">
                      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                      <polyline points="16 17 22 17 22 11"></polyline>
                    </svg>
                  )}
                </div>
                <div className="mb-2">
                  <span className="text-lg font-mono font-bold text-white">
                    ${p.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
                <div>
                  <span className={cn(
                    "text-sm font-mono font-medium",
                    p.changePct >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {p.changePct >= 0 ? "+" : ""}{p.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <span className="text-xs text-neutral-500">Live data • Updated every 5 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
} 