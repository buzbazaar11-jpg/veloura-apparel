import { createFileRoute } from "@tanstack/react-router";

import { ShopPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — VEL0URA APPAREL" },
      { name: "description", content: "Fresh pieces designed for the new season. Shop the latest VEL0URA APPAREL arrivals." },
      { property: "og:title", content: "New Arrivals — VEL0URA APPAREL" },
      { property: "og:description", content: "Fresh pieces designed for the new season." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ShopPage mode="new" />,
});
