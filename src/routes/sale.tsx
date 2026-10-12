import { createFileRoute } from "@tanstack/react-router";

import { ShopPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/sale")({
  head: () => ({
    meta: [
      { title: "The Sale Edit — VEL0URA APPAREL" },
      { name: "description", content: "Up to 30% off selected VEL0URA APPAREL styles. Marked prices, no games." },
      { property: "og:title", content: "The Sale Edit — VEL0URA APPAREL" },
      { property: "og:description", content: "Up to 30% off selected VEL0URA APPAREL styles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ShopPage mode="sale" />,
});
