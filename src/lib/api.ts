// Client for the FastAPI backend in /backend. Set VITE_API_URL (e.g. https://api.velouraapparel.store)
// to enable it; without it the storefront keeps working on local device storage.
import { useQuery } from "@tanstack/react-query";
import { products } from "./veloura-data";
import type { CartItem, Order } from "./veloura-store";

// ─── Payload types ────────────────────────────────────────────────────────────

export type SiteSettingsPayload = {
  brand_name?: string;
  brand_name_size?: number;
  brand_tagline?: string;
  brand_tagline_size?: number;
  logo_url?: string;
  logo_width?: number;
  logo_height?: number;
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

export type UserProfile = {
  id: string;
  email: string;
  phone?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  is_verified?: boolean;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
};

export type AuthResponse = {
  ok: boolean;
  token?: string;
  user?: UserProfile;
  roles?: string[];
  requires_otp?: boolean;
  email?: string;
  message?: string;
};

export type ProfileResponse = {
  ok: boolean;
  profile?: {
    full_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    avatar_url?: string;
  } | null;
  orders?: any[];
  user?: UserProfile;
};

export const authStorage = {
  getToken: () => (typeof window !== "undefined" ? localStorage.getItem("va_user_token") : null),
  setToken: (token: string) => { if (typeof window !== "undefined") localStorage.setItem("va_user_token", token); },
  removeToken: () => { if (typeof window !== "undefined") localStorage.removeItem("va_user_token"); },
  getUser: (): UserProfile | null => {
    try {
      const u = typeof window !== "undefined" ? localStorage.getItem("va_user_data") : null;
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },
  setUser: (user: UserProfile) => { if (typeof window !== "undefined") localStorage.setItem("va_user_data", JSON.stringify(user)); },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("va_user_token");
      localStorage.removeItem("va_user_data");
    }
  }
};

export const api = {
  health: () => request<{ ok: boolean }>("/health"),
  validateCoupon: (code: string, subtotal: number) =>
    request<{ ok: boolean; discount?: number; error?: string }>("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
  trackLead: (body: {
    session_id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    stage?: string;
    items?: unknown[];
    item_count?: number;
    cart_value?: number;
    currency?: string;
    notes?: string;
  }) => {
    let sid = body.session_id;
    if (!sid && typeof window !== "undefined") {
      sid = localStorage.getItem("va_session_id") || "";
      if (!sid) {
        sid = "sid_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem("va_session_id", sid);
      }
    }
    return request<{ ok: boolean; lead_id?: string; session_id?: string }>("/track/lead", {
      method: "POST",
      body: JSON.stringify({ ...body, session_id: sid }),
    }).catch(() => ({ ok: false }));
  },
  createOrder: (order: Omit<Order, "id" | "date" | "status">, idempotencyKey: string) => {
    const token = authStorage.getToken();
    const sid = typeof window !== "undefined" ? localStorage.getItem("va_session_id") || undefined : undefined;
    return request<{ ok: boolean; order: { order_number: string; status: string; total: number } }>("/orders", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        shipping_address: [order.address.address, order.address.state, order.address.postalCode, order.address.country].filter(Boolean).join(", "),
        city: order.address.city,
        payment_method: order.paymentMethod === "Cash on Delivery" ? "cod" : "card",
        coupon_code: order.coupon,
        idempotency_key: idempotencyKey,
        session_id: sid,
        items: order.items.map((i: CartItem) => ({ slug: i.slug ?? products.find(p => p.id === i.productId)?.slug, quantity: i.quantity, color: i.color, size: i.size })),
      }),
    });
  },
  trackOrder: (orderNumber: string, email: string) =>
    request<{ ok: boolean; order: { order_number: string; status: string; status_history: { status: string; at: string }[]; total: number } }>(`/orders/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`),
  submitReview: (body: { product_id?: string; customer_name: string; rating: number; title?: string; body?: string }) =>
    request<{ ok: boolean; message: string }>("/reviews", { method: "POST", body: JSON.stringify(body) }),
  auth: {
    signup: (body: { email: string; password: string; full_name?: string; phone?: string }) =>
      request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
    verifyOtp: (body: { email: string; otp: string }) =>
      request<AuthResponse>("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
    resendOtp: (email: string) =>
      request<{ ok: boolean; message: string }>("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
    login: (body: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    getProfile: (token: string) =>
      request<ProfileResponse>("/auth/profile", { headers: { Authorization: `Bearer ${token}` } }),
    updateProfile: (token: string, body: { full_name?: string; phone?: string; address?: string; city?: string; postal_code?: string; avatar_url?: string }) =>
      request<{ ok: boolean; profile: any }>("/auth/profile", { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
    uploadAvatar: async (token: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/api/v1/auth/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { detail?: string }).detail ?? `Upload failed (${res.status})`);
      return data as { ok: boolean; avatar_url: string };
    },
    changePassword: (token: string, body: { current_password: string; new_password: string }) =>
      request<{ ok: boolean; message: string }>("/auth/change-password", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }),
  },
};

// ─── React Query hooks ────────────────────────────────────────────────────────
//
// CACHING STRATEGY:
//   staleTime: how long data is "fresh" — no refetch during this window
//   refetchInterval: background polling interval (ONLY when tab is visible)
//   Content that rarely changes (settings, categories, deals): 5 min stale, 2 min poll
//   Content that changes moderately (products, hero): 2 min stale, 60s poll
//   Live content (reviews, coupons): 30s stale, 30s poll
//   One-time popups: 5 min stale, no poll
//
// WHY: previous code polled EVERY endpoint every 1 second → 10+ requests/sec
// to Supabase Japan region (200-400ms RTT) = constant loading, slow UI.

const POLL_SLOW = 2 * 60 * 1000;    // 2 minutes — settings, categories, deals
const POLL_MED  = 60 * 1000;         // 60 seconds — products, hero slides
const POLL_FAST = 30 * 1000;         // 30 seconds — reviews, coupons, popups
const STALE_SLOW = 5 * 60 * 1000;   // 5 minutes stale
const STALE_MED  = 2 * 60 * 1000;   // 2 minutes stale
const STALE_FAST = 30 * 1000;        // 30 seconds stale

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => request<{ ok: boolean; settings: SiteSettingsPayload; payment: PaymentSettingsPayload }>("/settings"),
    staleTime: 2000,
    refetchInterval: apiEnabled ? 3000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    enabled: apiEnabled,
    placeholderData: { ok: true, settings: {} as SiteSettingsPayload, payment: {} as PaymentSettingsPayload },
  });
}

const initialHeroSlides: HeroSlidePayload[] = [
  {
    id: "slide-apparel-1",
    eyebrow: "AUTUMN / WINTER 2026",
    title: "THE MEN'S LEATHER & APPAREL EDIT",
    description: "Mastercrafted genuine leather jackets, crisp layered overshirts, and relaxed tailored trousers built for modern everyday elegance.",
    cta_label: "SHOP COLLECTION",
    cta_href: "/collections",
    image_url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=1600",
  },
  {
    id: "slide-apparel-2",
    eyebrow: "CONTEMPORARY SILHOUETTES",
    title: "CURATED MEN'S OUTFITS",
    description: "Effortless styling from day to night with premium natural fibers, considered drape, and unmatched hand-finished detailing.",
    cta_label: "EXPLORE OUTFITS",
    cta_href: "/shop",
    image_url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1600",
  },
  {
    id: "slide-apparel-3",
    eyebrow: "EVERYDAY ESSENTIALS",
    title: "SHIRTS, CHINOS & TAILORED DRAPE",
    description: "Discover breathable Oxford weaves, heavy twill utility cuts, and clean tailored fits crafted for confidence.",
    cta_label: "DISCOVER NOW",
    cta_href: "/shop",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1600",
  },
];

export function useHeroSlides() {
  return useQuery({
    queryKey: ["hero-slides"],
    queryFn: () => request<{ ok: boolean; slides: HeroSlidePayload[] }>("/hero-slides"),
    staleTime: STALE_MED,
    refetchInterval: apiEnabled ? POLL_MED : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: apiEnabled,
    placeholderData: { ok: true, slides: initialHeroSlides },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => request<{ ok: boolean; categories: CategoryPayload[] }>("/categories"),
    staleTime: STALE_SLOW,
    refetchInterval: apiEnabled ? POLL_SLOW : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: apiEnabled,
    placeholderData: { ok: true, categories: [] as CategoryPayload[] },
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog"],
    queryFn: () => request<{ ok: boolean; posts: BlogPostPayload[] }>("/blog"),
    staleTime: STALE_SLOW,
    refetchInterval: apiEnabled ? POLL_SLOW : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: apiEnabled,
    placeholderData: { ok: true, posts: [] as BlogPostPayload[] },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => request<{ ok: boolean; post: BlogPostPayload }>(`/blog/${encodeURIComponent(slug)}`),
    staleTime: STALE_SLOW,
    refetchInterval: false,
    refetchOnWindowFocus: false,
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
    staleTime: STALE_FAST,
    refetchInterval: apiEnabled ? POLL_FAST : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: apiEnabled,
    placeholderData: { ok: true, reviews: [] as ReviewPayload[] },
  });
}

export function usePopups() {
  return useQuery({
    queryKey: ["popups"],
    queryFn: () => request<{ ok: boolean; popups: PopupPayload[] }>("/popups"),
    staleTime: STALE_SLOW,
    refetchInterval: false,
    refetchOnWindowFocus: false,
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
  audience?: string | null;
  gender?: string | null;
  collection?: string | null;
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
  new_arrival?: boolean;
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

const initialBackendProducts: BackendProductPayload[] = products.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  collection: p.collection ?? null,
  audience: p.audience,
  price: p.price,
  sale_price: p.salePrice ?? null,
  image_url: p.images[0] ?? "",
  gallery: p.images.slice(1),
  colors: p.colors,
  sizes: p.sizes,
  features: p.tags,
  stock: p.stock,
  description: p.description,
  featured: p.featured,
  new_arrival: p.newArrival,
  rating: p.rating,
  reviews: p.reviewCount,
  active: true,
}));

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => request<{ ok: boolean; products: BackendProductPayload[] }>("/products"),
    staleTime: STALE_MED,
    refetchInterval: apiEnabled ? POLL_MED : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: apiEnabled,
    placeholderData: { ok: true, products: initialBackendProducts },
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => request<{ ok: boolean; collections: CollectionPayload[] }>("/collections"),
    staleTime: STALE_SLOW,
    refetchInterval: apiEnabled ? POLL_SLOW : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: apiEnabled,
    placeholderData: { ok: true, collections: [] as CollectionPayload[] },
  });
}

// ─── Homepage content ─────────────────────────────────────────────────────────

export type FaqPayload = { id: string; question: string; answer: string; category?: string | null };
export type TrustPayload = { id: string; group_name: string; heading: string; body?: string | null; bullets?: string[]; icon?: string | null };
export type DealPayload = {
  id: string; title: string; subtitle?: string | null; description?: string | null; badge?: string | null;
  discount_percent?: number; code?: string | null; image_url?: string | null; cta_label?: string | null; cta_href?: string | null;
  ends_at?: string | null;
};

function liveQuery<T>(key: string[], path: string, empty: T, staleMs = STALE_MED, pollMs = POLL_MED) {
  return {
    queryKey: key,
    queryFn: () => request<T>(path),
    staleTime: staleMs,
    refetchInterval: apiEnabled ? pollMs : (false as const),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: apiEnabled,
    placeholderData: empty,
  };
}

export const useFaqs    = () => useQuery(liveQuery(["faqs"],          "/faqs",    { ok: true, faqs:     [] as FaqPayload[]    }, STALE_SLOW, POLL_SLOW));
export const useTrust   = () => useQuery(liveQuery(["trust"],         "/trust",   { ok: true, sections: [] as TrustPayload[] }, STALE_SLOW, POLL_SLOW));
export const useDeals   = () => useQuery(liveQuery(["deals-home"],    "/deals",   { ok: true, deals:    [] as DealPayload[]   }, STALE_MED,  POLL_MED));

export type CouponPublicPayload = {
  id: string; code: string; discount_type: string; discount_value: number; description?: string | null;
};

export const useCoupons = () => useQuery(liveQuery(["coupons-public"], "/coupons", { ok: true, coupons: [] as CouponPublicPayload[] }, STALE_FAST, POLL_FAST));
