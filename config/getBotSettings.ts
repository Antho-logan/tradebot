import { botSettings } from "./botSettings";

export interface BotConfig {
  exchange: string;
  coinUniverse: string[];
  timeframes: string[];
  risk: {
    perTradeFraction: number;
    dailyLossCapFraction: number;
  };
}

/**
 * Return the active bot settings.
 * Precedence:
 *   1. localStorage overrides (future Settings UI)
 *   2. process.env override (NEXT_PUBLIC_EXCHANGE_SLUG)
 *   3. Hard-coded defaults in botSettings.ts
 */
export function getBotSettings() {
  // 1) browser override
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("tgpt-bot-settings");
    if (raw) {
      try {
        // TODO: Future Settings page will write user overrides here
        return { ...botSettings, ...JSON.parse(raw) };
      } catch {
        console.warn("Malformed settings in localStorage; using defaults.");
      }
    }
  }

  // 2) env override
  const envExchange = process.env.NEXT_PUBLIC_EXCHANGE_SLUG;
  if (envExchange) {
    return { ...botSettings, exchange: envExchange };
  }

  // 3) default
  return botSettings;
}

/**
 * Save bot settings to localStorage (client-side only).
 */
export function saveBotSettings(settings: Partial<BotConfig>): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem("tgpt-bot-settings", JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving bot settings to localStorage:", e);
  }
}

/**
 * Reset bot settings to defaults (clears localStorage overrides).
 */
export function resetBotSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tgpt-bot-settings");
} 