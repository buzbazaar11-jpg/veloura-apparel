import { createFileRoute } from "@tanstack/react-router";

import { ShopPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/best-sellers")({
  head: () => ({
    meta: [
      { title: "Best Sellers — VEL0URA APPAREL" },
      { name: "description", content: "The most-loved VEL0URA APPAREL pieces, chosen by customers like you." },
      { property: "og:title", content: "Best Sellers — VEL0URA APPAREL" },
      { property: "og:description", content: "The most-loved VEL0URA APPAREL pieces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ShopPage mode="best" />,
});
