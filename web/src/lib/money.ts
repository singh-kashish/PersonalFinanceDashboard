/**
 * Money formatting utilities for the web client.
 * All money values from the API are strings with exactly 2 decimal places (e.g., "450.75").
 */

// Default currency for the app (can be overridden per user/workspace later)
export const DEFAULT_CURRENCY = 'INR';

/**
 * Formats a money string for display using Intl.NumberFormat.
 * @param amount - Money string from API (e.g., "450.75", "-50.00", "0.00")
 * @param currency - ISO 4217 currency code (default: INR)
 * @param locale - Locale for formatting (default: en-IN for Indian Rupees)
 * @returns Formatted string (e.g., "₹450.75", "-₹50.00")
 */
export function formatMoney(
  amount: string,
  currency: string = DEFAULT_CURRENCY,
  locale: string = 'en-IN'
): string {
  const num = Number(amount);
  if (!Number.isFinite(num)) {
    return `${currency} 0.00`;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Converts a money string to a number for chart libraries.
 * Use ONLY for feeding chart libraries that require numeric input.
 * Do NOT use for calculations or display.
 * @param amount - Money string from API (e.g., "450.75")
 * @returns Number representation (e.g., 450.75)
 */
export function toChartNumber(amount: string): number {
  const num = Number(amount);
  if (!Number.isFinite(num)) {
    return 0;
  }
  return num;
}

/**
 * Parses a money string to a number with validation.
 * Use for client-side validation before sending to API.
 * @param amount - Money string to parse
 * @returns Number if valid, null if invalid
 */
export function parseMoneyString(amount: string): number | null {
  if (!/^\-?\d+\.\d{2}$/.test(amount)) {
    return null;
  }
  const num = Number(amount);
  return Number.isFinite(num) ? num : null;
}
