export const SHOP_DEPARTMENTS = ["Mens", "Womens", "Kids"] as const;
export type ShopDepartment = typeof SHOP_DEPARTMENTS[number];

export function normalizeAudience(value: string | null | undefined): ShopDepartment | undefined {
  const text = (value ?? "").toLowerCase().replace(/[’']/g, "");
  // Check women before men: substring matching would classify womens as mens.
  if (/\b(woman|women|womens|female|ladies|girl|girls)\b/.test(text)) return "Womens";
  if (/\b(kid|kids|child|children|baby|babies|junior|boys|boy)\b/.test(text)) return "Kids";
  if (/\b(man|men|mens|male|gentlemen)\b/.test(text)) return "Mens";
  return undefined;
}

export function resolveProductAudience(product: {
  audience?: string | null;
  gender?: string | null;
  category?: string | null;
  collection?: string | null;
  name?: string;
  features?: string[];
}, fallback?: string): string {
  for (const field of [product.audience, product.gender, product.category, ...(product.features ?? []), product.collection, product.name]) {
    const audience = normalizeAudience(field);
    if (audience) return audience;
  }
  return normalizeAudience(fallback) ?? "";
}

export function matchesDepartment(audience: string, department: ShopDepartment): boolean {
  return normalizeAudience(audience) === department;
}