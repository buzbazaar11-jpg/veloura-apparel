import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ShopPage } from "@/components/veloura/commerce";

const shopSearchSchema = z.object({
  category: z.string().optional(),
  collection: z.string().optional(),
  mode: z.enum(["all", "new", "best", "sale"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => shopSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Shop VEL0URA APPAREL" },
      { name: "description", content: "Browse the full VEL0URA APPAREL collection: jackets, shirts, trousers, hoodies, sneakers and accessories." },
      { property: "og:title", content: "Shop VEL0URA APPAREL" },
      { property: "og:description", content: "Browse the full VEL0URA APPAREL collection of modern essentials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

