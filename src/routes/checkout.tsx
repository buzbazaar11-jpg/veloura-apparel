import { createFileRoute } from "@tanstack/react-router";

import { CheckoutPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — VEL0URA APPAREL" },
      { name: "description", content: "Complete your VEL0URA APPAREL order with contact, delivery and payment details." },
      { property: "og:title", content: "Checkout — VEL0URA APPAREL" },
      { property: "og:description", content: "Complete your VEL0URA APPAREL order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});
