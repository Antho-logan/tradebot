/**
 * Utility functions for consistent number formatting
 * Prevents hydration mismatches by avoiding locale-dependent formatting
 */

// Counter for generating consistent IDs
let idCounter = 0;

/**
 * Generate a consistent ID that won't cause hydration mismatches
 * Uses a counter instead of Date.now() or Math.random()
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Format a number with comma separators (e.g., 1000 -> "1,000")
 * Uses consistent formatting to prevent SSR/client hydration mismatches
 */
export function formatNumber(num: number): string {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a price with appropriate decimal places and comma separators
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return formatNumber(price);
  } else if (price >= 1) {
    return price.toFixed(2);
  } else {
    return price.toFixed(4);
  }
}

/**
 * Format a percentage with sign and 2 decimal places
 */
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * Format a PnL value with 2 decimal places
 */
export function formatPnL(value: number): string {
  return value.toFixed(2);
}

/**
 * Format currency with dollar sign and comma separators
 */
export function formatCurrency(amount: number): string {
  return `$${formatNumber(amount)}`;
} 