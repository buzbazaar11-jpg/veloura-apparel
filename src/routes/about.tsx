import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About VEL0URA APPAREL" },
      { name: "description", content: "VEL0URA APPAREL creates modern essentials focused on clean silhouettes, thoughtful details and effortless style." },
      { property: "og:title", content: "About VEL0URA APPAREL" },
      { property: "og:description", content: "Designed for everyday. Discover the story of VEL0URA APPAREL." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});
