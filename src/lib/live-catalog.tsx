// Live catalog helpers — converts backend product rows to the frontend Product shape.
// Products/collections are now fetched via useProducts()/useCollections() React Query hooks
// in src/lib/api.ts. This file keeps fromBackend(), assetUrl(), and deals polling.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { API_URL, apiEnabled, type BackendProductPayload } from "./api";
import { products, type Product } from "./veloura-data";

export type LiveDeal = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  badge?: string | null;
  discount_percent: number;
  code?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
};

const localDefaults = new Map(products.map((p) => [p.slug, p]));
const fallbackImage = products[0]?.images[0] ?? "";

export function assetUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.startsWith("/") ? `${API_URL}${url}` : url;
}

export function fromBackend(b: BackendProductPayload): Product {
  const base = localDefaults.get(b.slug);
  const images = [b.image_url, ...(b.gallery ?? [])]
    .map(assetUrl)
    .filter(Boolean) as string[];
  return {
    id: base?.id ?? b.id,
    slug: b.slug,
    name: b.name,
    category: b.category ?? base?.category ?? "Accessories",
    price: Number(b.price),
    salePrice:
      b.sale_price != null && Number(b.sale_price) < Number(b.price)
        ? Number(b.sale_price)
        : undefined,
    description: b.description || base?.description || "",
    images: images.length ? images : (base?.images ?? [fallbackImage]),
    colors: b.colors?.length ? b.colors : (base?.colors ?? ["Black"]),
    sizes: b.sizes?.length ? b.sizes : (base?.sizes ?? ["One Size"]),
    stock: b.stock ?? 0,
    tags: b.features?.length ? b.features : (base?.tags ?? []),
    rating: base?.rating ?? Number(b.rating ?? 4.8),
    reviewCount: base?.reviewCount ?? Number(b.reviews ?? 0),
    audience: "Men",
    featured: b.featured ?? base?.featured ?? false,
    newArrival: base?.newArrival ?? !base,
    bestSeller: base?.bestSeller ?? false,
    mood: base?.mood ?? "Everyday",
    fit: base?.fit ?? "",
    material: base?.material ?? "",
    care: base?.care ?? "",
  };
}

export async function fetchBackendProduct(slug: string): Promise<Product | undefined> {
  if (!apiEnabled) return undefined;
  const res = await fetch(
    `${API_URL}/api/v1/products/${encodeURIComponent(slug)}`
  ).catch(() => null);
  if (!res?.ok) return undefined;
  const data = (await res.json()) as { product: BackendProductPayload };
  return fromBackend(data.product);
}

// ── Deals live polling (still uses polling — deals change infrequently) ───────
const LiveContext = createContext<{
  version: number;
  deals: LiveDeal[];
  online: boolean;
}>({ version: 0, deals: [], online: false });

export const useLiveCatalog = () => useContext(LiveContext);

export function LiveCatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    version: 0,
    deals: [] as LiveDeal[],
    online: false,
  });

  useEffect(() => {
    if (!apiEnabled) return;
    let last = "";

    const sync = async () => {
      try {
        const d = await fetch(`${API_URL}/api/v1/deals`).then(
          (r) => r.json() as Promise<{ deals: LiveDeal[] }>
        );
        const snapshot = JSON.stringify(d.deals);
        if (snapshot === last) return;
        last = snapshot;
        setState((s) => ({
          version: s.version + 1,
          deals: d.deals,
          online: true,
        }));
      } catch {
        setState((s) => (s.online ? { ...s, online: false } : s));
      }
    };

    void sync();
    const timer = window.setInterval(sync, 30_000);
    const onFocus = () => void sync();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return <LiveContext.Provider value={state}>{children}</LiveContext.Provider>;
}

/** Re-renders its children whenever the backend catalog changes. */
export function LiveRefresh({ children }: { children: ReactNode }) {
  const { version } = useLiveCatalog();
  return (
    <div key={version} className="contents">
      {children}
    </div>
  );
}

export function LiveDeals() {
  const { deals } = useLiveCatalog();
  if (!deals.length) return null;
  return (
    <section className="store-section" aria-label="Current deals">
      <p className="editorial-label">LIVE DEALS</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => (
          <article
            key={deal.id}
            className="overflow-hidden rounded-[18px] border border-border bg-card"
          >
            {deal.image_url ? (
              <img
                src={assetUrl(deal.image_url)}
                alt={deal.title}
                loading="lazy"
                className="aspect-[16/9] w-full object-cover"
              />
            ) : null}
            <div className="p-5">
              {deal.badge ? (
                <p className="text-xs font-semibold uppercase text-sage">
                  {deal.badge}
                </p>
              ) : null}
              <h3 className="mt-2 font-display text-3xl">{deal.title}</h3>
              {deal.subtitle || deal.description ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {deal.subtitle || deal.description}
                </p>
              ) : null}
              <p className="mt-3 text-sm font-semibold">
                {deal.discount_percent ? `${deal.discount_percent}% off` : null}
                {deal.code ? ` · Code ${deal.code}` : null}
              </p>
              {deal.cta_href ? (
                <a
                  href={deal.cta_href}
                  className="mt-4 inline-block text-xs font-semibold uppercase underline underline-offset-4"
                >
                  {deal.cta_label || "Shop the deal"}
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
