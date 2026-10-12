import { createFileRoute } from "@tanstack/react-router";

import { ShopPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/shop")({
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
