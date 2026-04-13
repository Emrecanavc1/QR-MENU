import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "TRY"
): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: string = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", İ: "I",
    ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U",
  };
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (match) => trMap[match] || match)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getMultiLangValue(
  value: unknown,
  lang: string = "tr"
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, string>;
    return obj[lang] ?? obj["tr"] ?? Object.values(obj)[0] ?? "";
  }
  return String(value);
}

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export function calculateOrderTotal(
  items: { unitPrice: number; quantity: number; selectedExtras?: { price: number }[] | null }[]
): number {
  return items.reduce((total, item) => {
    const extrasTotal = item.selectedExtras
      ? item.selectedExtras.reduce((s, e) => s + e.price, 0)
      : 0;
    return total + (item.unitPrice + extrasTotal) * item.quantity;
  }, 0);
}
