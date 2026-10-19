import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ShopPage } from "@/components/veloura/commerce";

const shopSearchSchema = z.object({
  category: z.string().optional(),
  department: z.enum(["Mens", "Womens", "Kids"]).optional(),
  collection: z.string().optional(),
  mode: z.enum(["all", "new", "best", "sale"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => shopSearchSchema.parse(search),
  head: ({ match }) => ({
    meta: [
      { title: `${match.search.department ?? "Shop"} — VELOURA APPAREL` },
      { name: "description", content: "Browse the full VEL0URA APPAREL collection: jackets, shirts, trousers, hoodies, sneakers and accessories." },
      { property: "og:title", content: `${match.search.department ?? "Shop"} — VELOURA APPAREL` },
      { property: "og:description", content: "Browse the full VEL0URA APPAREL collection of modern essentials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

