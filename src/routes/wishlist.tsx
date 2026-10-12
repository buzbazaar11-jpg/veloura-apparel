import { createFileRoute } from "@tanstack/react-router";

import { WishlistPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — VEL0URA APPAREL" },
      { name: "description", content: "Save the VEL0URA APPAREL pieces you love and move them to your bag whenever you are ready." },
      { property: "og:title", content: "Your Wishlist — VEL0URA APPAREL" },
      { property: "og:description", content: "Save the VEL0URA APPAREL pieces you love." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WishlistPage,
});
