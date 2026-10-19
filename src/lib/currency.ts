import { useSyncExternalStore } from "react";

export type CurrencyCode = "PKR" | "USD" | "AED" | "GBP" | "EUR" | "SAR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // against 1 PKR
  flag: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  PKR: { code: "PKR", symbol: "Rs.", name: "Pakistani Rupee", rate: 1, flag: "🇵🇰", decimals: 0 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 1 / 280, flag: "🇺🇸", decimals: 2 },
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham", rate: 1 / 76.5, flag: "🇦🇪", decimals: 0 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 1 / 365, flag: "🇬🇧", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 1 / 305, flag: "🇪🇺", decimals: 2 },
  SAR: { code: "SAR", symbol: "SAR", name: "Saudi Riyal", rate: 1 / 74.5, flag: "🇸🇦", decimals: 0 },
};

let currentCurrency: CurrencyCode = "PKR";
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("va_currency") as CurrencyCode | null;
  if (saved && CURRENCIES[saved]) {
    currentCurrency = saved;
  }
}

const listeners = new Set<() => void>();

export function getActiveCurrency(): CurrencyCode {
  return currentCurrency;
}

export function setActiveCurrency(curr: CurrencyCode) {
  if (!CURRENCIES[curr]) return;
  currentCurrency = curr;
  if (typeof window !== "undefined") {
    localStorage.setItem("va_currency", curr);
  }
  listeners.forEach((l) => l());
}

export function subscribeCurrency(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function useCurrency(): [CurrencyCode, (code: CurrencyCode) => void] {
  const currency = useSyncExternalStore<CurrencyCode>(
    subscribeCurrency,
    () => currentCurrency,
    () => "PKR"
  );
  return [currency, setActiveCurrency];
}

export function formatMoney(amountInPkr: number, overrideCurrency?: CurrencyCode): string {
  const safe = Number.isFinite(amountInPkr) ? amountInPkr : 0;
  const currCode = overrideCurrency || currentCurrency;
  const config = CURRENCIES[currCode] || CURRENCIES.PKR;

  const converted = safe * config.rate;

  if (config.decimals === 0) {
    return `${config.symbol} ${Math.round(converted).toLocaleString("en-US")}`;
  }
  return `${config.symbol} ${converted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
