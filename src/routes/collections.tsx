import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { CollectionsPage } from "@/components/veloura/commerce";

const collectionsSearchSchema = z.object({
  collection: z.string().optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
});

export const Route = createFileRoute("/collections")({
  validateSearch: (search: Record<string, unknown>) => collectionsSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Curated Collections — VELOURA APPAREL" },
      { name: "description", content: "Explore the curated VELOURA APPAREL menswear collections: Men's Leather Collection, Shirts & Overshirts, Pants & Tailored Trousers, and Complete Outfits." },
      { property: "og:title", content: "Curated Collections — VELOURA APPAREL" },
      { property: "og:description", content: "Discover VELOURA APPAREL curated men's collections with strict category filtering." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsPage,
});

