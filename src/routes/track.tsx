import { createFileRoute } from "@tanstack/react-router";

import { TrackOrderPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Order — VEL0URA APPAREL" },
      { name: "description", content: "Track your VEL0URA APPAREL order from confirmation through delivery." },
      { property: "og:title", content: "Track Order — VEL0URA APPAREL" },
      { property: "og:description", content: "Track your VEL0URA APPAREL order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackOrderPage,
});
