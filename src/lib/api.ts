// Client for the FastAPI backend in /backend. Set VITE_API_URL (e.g. https://api.yourdomain.com)
// to enable it; without it the storefront keeps working on local device storage.
import { useQuery } from "@tanstack/react-query";
import { products } from "./veloura-data";
import type { CartItem, Order } from "./veloura-store";

// ─── Payload types ────────────────────────────────────────────────────────────

export type SiteSettingsPayload = {
  brand_name?: string;
  brand_tagline?: string;
  marquee_items?: string[];
  contact_email?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  address?: string;
};

export type PaymentSettingsPayload = {
  currency?: string;
  delivery_charge?: number;
  free_delivery_above?: number;
  cod_enabled?: boolean;
  easypaisa_enabled?: boolean;
  easypaisa_number?: string;
  jazzcash_enabled?: boolean;
  jazzcash_number?: string;
  bank_enabled?: boolean;
  bank_name?: string;
  bank_account_title?: string;
  bank_account_number?: string;
  payment_note?: string;
};

export type HeroSlidePayload = {
  id: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  cta_label?: string;
  cta_href?: string;
  image_url?: string;
};

export type CategoryPayload = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
};

export type BlogPostPayload = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  image_url?: string;
  category?: string;
  published_at?: string;
};

export type ReviewPayload = {
  id: string;
  product_id?: string;
  customer_name: string;
  rating: number;
  title?: string;
  body?: string;
  created_at?: string;
};

export type PopupPayload = {
  id: string;
  title?: string;
  message?: string;
  badge?: string;
  cta_label?: string;
  cta_href?: string;
  coupon_code?: string;
  delay_seconds?: number;
  active?: boolean;
};

export const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined)?.replace(/\/$/, "") ?? "";
export const apiEnabled = Boolean(API_URL);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean }>("/health"),
  validateCoupon: (code: string, subtotal: number) =>
    request<{ ok: boolean; discount?: number; error?: string }>("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
  createOrder: (order: Omit<Order, "id" | "date" | "status">, idempotencyKey: string) =>
    request<{ ok: boolean; order: { order_number: string; status: string; total: number } }>("/orders", {
      method: "POST",
      body: JSON.stringify({
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        shipping_address: [order.address.address, order.address.state, order.address.postalCode, order.address.country].filter(Boolean).join(", "),
        city: order.address.city,
        payment_method: order.paymentMethod === "Cash on Delivery" ? "cod" : "card",
        coupon_code: order.coupon,
        idempotency_key: idempotencyKey,
        items: order.items.map((i: CartItem) => ({ slug: products.find(p => p.id === i.productId)?.slug, quantity: i.quantity, color: i.color, size: i.size })),
      }),
    }),
  trackOrder: (orderNumber: string, email: string) =>
    request<{ ok: boolean; order: { order_number: string; status: string; status_history: { status: string; at: string }[]; total: number } }>(`/orders/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`),
  submitReview: (body: { product_id?: string; customer_name: string; rating: number; title?: string; body?: string }) =>
    request<{ ok: boolean; message: string }>("/reviews", { method: "POST", body: JSON.stringify(body) }),
};

// ─── React Query hooks ────────────────────────────────────────────────────────

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () =>
      request<{ ok: boolean; settings: SiteSettingsPayload; payment: PaymentSettingsPayload }>("/settings"),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: { ok: true, settings: {} as SiteSettingsPayload, payment: {} as PaymentSettingsPayload },
  });
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ["hero-slides"],
    queryFn: () => request<{ ok: boolean; slides: HeroSlidePayload[] }>("/hero-slides"),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: { ok: true, slides: [] as HeroSlidePayload[] },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => request<{ ok: boolean; categories: CategoryPayload[] }>("/categories"),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: { ok: true, categories: [] as CategoryPayload[] },
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog"],
    queryFn: () => request<{ ok: boolean; posts: BlogPostPayload[] }>("/blog"),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: { ok: true, posts: [] as BlogPostPayload[] },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => request<{ ok: boolean; post: BlogPostPayload }>(`/blog/${encodeURIComponent(slug)}`),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    enabled: apiEnabled,
    placeholderData: { ok: true, post: null as unknown as BlogPostPayload },
  });
}

export function useReviews(productId?: string) {
  return useQuery({
    queryKey: ["reviews", productId ?? "all"],
    queryFn: async () => {
      const result = await request<{ ok: boolean; reviews: ReviewPayload[] }>("/reviews");
      if (productId) {
        return { ...result, reviews: result.reviews.filter(r => r.product_id === productId) };
      }
      return result;
    },
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: { ok: true, reviews: [] as ReviewPayload[] },
  });
}

export function usePopups() {
  return useQuery({
    queryKey: ["popups"],
    queryFn: () => request<{ ok: boolean; popups: PopupPayload[] }>("/popups"),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    enabled: apiEnabled,
    placeholderData: { ok: true, popups: [] as PopupPayload[] },
  });
}

export type BackendProductPayload = {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: string | null;
  price: number;
  sale_price: number | null;
  compare_at?: number | null;
  image_url: string;
  gallery: string[];
  colors: string[];
  sizes: string[];
  features: string[];
  stock: number;
  description: string;
  featured?: boolean;
  active?: boolean;
  badge?: string | null;
  rating?: number;
  reviews?: number;
};

export type CollectionPayload = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  image_url?: string | null;
  sort_order?: number;
  active?: boolean;
};

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => request<{ ok: boolean; products: BackendProductPayload[] }>("/products"),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: { ok: true, products: [] as BackendProductPayload[] },
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => request<{ ok: boolean; collections: CollectionPayload[] }>("/collections"),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : false,
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: { ok: true, collections: [] as CollectionPayload[] },
  });
}

// ─── Homepage content (all from the database, no fallbacks) ──────────────────

export type FaqPayload = { id: string; question: string; answer: string; category?: string | null };
export type TrustPayload = { id: string; group_name: string; heading: string; body?: string | null; bullets?: string[]; icon?: string | null };
export type DealPayload = {
  id: string; title: string; subtitle?: string | null; description?: string | null; badge?: string | null;
  discount_percent?: number; code?: string | null; image_url?: string | null; cta_label?: string | null; cta_href?: string | null;
  ends_at?: string | null;
};

function liveQuery<T>(key: string[], path: string, empty: T) {
  return {
    queryKey: key,
    queryFn: () => request<T>(path),
    staleTime: 0,
    refetchInterval: apiEnabled ? 1_000 : (false as const),
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: empty,
  };
}

export const useFaqs = () => useQuery(liveQuery(["faqs"], "/faqs", { ok: true, faqs: [] as FaqPayload[] }));
export const useTrust = () => useQuery(liveQuery(["trust"], "/trust", { ok: true, sections: [] as TrustPayload[] }));
export const useDeals = () => useQuery(liveQuery(["deals-home"], "/deals", { ok: true, deals: [] as DealPayload[] }));
