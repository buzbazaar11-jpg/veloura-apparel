import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/veloura/home-live";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VELOURA APPAREL — Men's Everyday Essentials" },
      { name: "description", content: "Explore VELOURA APPAREL men's tees, shirts, jackets and trousers. Shop everyday essentials, new arrivals and selected seasonal deals." },
      { property: "og:title", content: "VELOURA APPAREL — Men's Everyday Essentials" },
      { property: "og:description", content: "Your everyday menswear edit. Discover clean tees, easy layers and selected seasonal deals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
