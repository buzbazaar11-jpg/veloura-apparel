import { createFileRoute } from "@tanstack/react-router";

import { OrderConfirmationPage } from "@/components/veloura/commerce";
import { useVelouraStore } from "@/lib/veloura-store";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — VEL0URA APPAREL" },
      { name: "description", content: "Your VEL0URA APPAREL order confirmation and delivery details." },
      { property: "og:title", content: "Order Confirmed — VEL0URA APPAREL" },
      { property: "og:description", content: "Thank you for choosing VEL0URA APPAREL." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderRoute,
});

function OrderRoute() {
  const { id } = Route.useParams();
  const { findOrder } = useVelouraStore();
  return <OrderConfirmationPage order={findOrder(id)} />;
}
