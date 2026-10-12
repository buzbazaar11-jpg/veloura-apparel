import { createFileRoute } from "@tanstack/react-router";

import { JournalPage } from "@/components/veloura/commerce";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "The VEL0URA APPAREL Journal" },
      { name: "description", content: "Styling guides, wardrobe thinking and stories from inside VEL0URA APPAREL." },
      { property: "og:title", content: "The VEL0URA APPAREL Journal" },
      { property: "og:description", content: "Notes on modern dressing from VEL0URA APPAREL." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JournalPage,
});
